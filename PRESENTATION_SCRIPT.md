# Aegis Demo Script

## Setup Check

Run these before presenting:

```bash
curl -s http://127.0.0.1:8000/health
curl -s http://127.0.0.1:5001/health
curl -s https://granny-oxford-posh.ngrok-free.dev/health
curl -s https://granny-oxford-posh.ngrok-free.dev/api/stats
```

Expected: both services and the public tunnel return `ok`.

## 90-Second Pitch

1. "Aegis lets an older adult request medication help without opening an app. They just take a photo of the bottle through WhatsApp or glasses."
2. "The backend receives the WhatsApp photo, analyzes the medication, checks whether the refill is needed, and creates a refill request."
3. "The patient gets a simple confirmation back in WhatsApp, including an audio note for accessibility."
4. "The backend keeps an audit trail: medication logs, order requests, confirmations, and payment metadata."
5. "When GOAT live payment is enabled, the same order request produces a real testnet transaction hash that can be opened on the explorer."

## Live Demo Flow

1. Open WhatsApp chat with Aegis.
2. Send the Lisinopril bottle photo.
3. Wait for the text response and voice note.
4. Expected WhatsApp reply:

```text
I found Lisinopril 10mg. Only about 3 pills left — placing a refill for you now.

The refill request is confirmed.

Receipt #<order_id>
Medicine: Lisinopril 10mg
Status: confirmed
Amount: 0.0000001 BTC
Transaction: 0x...
Proof: https://explorer.testnet3.goat.network/tx/0x...
```

5. Show the audit trail:

```bash
curl -s https://granny-oxford-posh.ngrok-free.dev/api/order-requests
curl -s https://granny-oxford-posh.ngrok-free.dev/api/stats
```

## GOAT Payment Segment

Live GOAT mode is configured locally for the demo.

1. Send the same WhatsApp photo.
2. Open `/api/order-requests`.
3. Copy the latest `tx_hash` or `goatScanUrl` from `agent_response`.
4. Open the transaction in the GOAT testnet explorer.

```text
https://explorer.testnet3.goat.network/tx/<tx_hash>
```

Speaker line:

```text
The refill request now has a payment proof. Aegis stores the medication, the refill decision, and the GOAT transaction hash in one audit trail.
```

Backup verified transaction:

```text
https://explorer.testnet3.goat.network/tx/0xd5b139a384f7859f3de4e8f97abf7e5c312efb09bff66967353f07d6e96f15aa
```

## If Something Fails

- If WhatsApp does not respond: check Twilio sandbox webhook is `https://granny-oxford-posh.ngrok-free.dev/webhook/whatsapp`.
- If the photo result is delayed: show `/api/order-requests`; the backend may still have logged the request.
- If GOAT explorer does not show a transaction: do not improvise. Show the confirmed order audit row and say the payment rail can be switched between provider modes.
