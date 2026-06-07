import base64
from types import SimpleNamespace

import algosdk
from algosdk import account, mnemonic
from x402 import x402Client
from x402.http.clients.httpx import x402HttpxClient
from x402.mechanisms.avm import ALGORAND_TESTNET_CAIP2
from x402.mechanisms.avm.exact.register import register_exact_avm_client

from src.models import CoverageReceipt

COVERAGE_URL = "http://127.0.0.1:4021/coverage"


def create_payment_client(payer_mnemonic: str) -> x402HttpxClient:
    private_key = mnemonic.to_private_key(payer_mnemonic)
    address = account.address_from_private_key(private_key)

    def sign_transactions(
        unsigned_txns: list[bytes],
        indexes_to_sign: list[int],
    ) -> list[bytes | None]:
        signed_txns: list[bytes | None] = []
        for index, txn_bytes in enumerate(unsigned_txns):
            if index not in indexes_to_sign:
                signed_txns.append(None)
                continue

            txn = algosdk.encoding.msgpack_decode(
                base64.b64encode(txn_bytes).decode()
            )
            signed = txn.sign(private_key)
            signed_txns.append(
                base64.b64decode(algosdk.encoding.msgpack_encode(signed))
            )
        return signed_txns

    signer = SimpleNamespace(
        address=address,
        sign_transactions=sign_transactions,
    )
    client = x402Client()
    register_exact_avm_client(
        client,
        signer,
        networks=ALGORAND_TESTNET_CAIP2,
    )
    return x402HttpxClient(client, timeout=60)


async def pay_for_coverage(
    client: x402HttpxClient,
    quote_id: str,
) -> CoverageReceipt:
    response = await client.post(f"{COVERAGE_URL}/{quote_id}")
    await response.aread()
    if response.is_error:
        detail = response.text
        payment_response = response.headers.get("payment-response")
        if payment_response:
            detail = f"{detail}; payment-response={payment_response}"
        raise RuntimeError(
            f"coverage request returned {response.status_code}: {detail}"
        )
    return CoverageReceipt.model_validate(response.json())
