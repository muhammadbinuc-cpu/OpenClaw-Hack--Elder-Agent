const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(express.json());

// ─── Fake medication data ────────────────────────────────────────────────────
const medications: Record<string, { name: string; dosage: string; delivery: string }> = {
  lisinopril: { name: "Lisinopril", dosage: "10mg", delivery: "Tomorrow by 2pm" },
  metformin: { name: "Metformin", dosage: "500mg", delivery: "Tomorrow by 2pm" },
  atorvastatin: { name: "Atorvastatin", dosage: "20mg", delivery: "Tomorrow by 2pm" }
};

// ─── Connect to GOAT Network ─────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(
  process.env.GOAT_RPC_URL || 'https://rpc.testnet3.goat.network'
);

// ─── Verify payment ──────────────────────────────────────────────────────────
async function verifyPayment(txHash: string): Promise<boolean> {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) { console.log('Transaction not found:', txHash); return false; }
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) { console.log('Transaction failed or pending'); return false; }
    const correctWallet = tx.to?.toLowerCase() === process.env.PHARMACY_WALLET_ADDRESS?.toLowerCase();
    const correctAmount = tx.value >= ethers.parseEther('0.0001');
    console.log('Correct wallet:', correctWallet);
    console.log('Correct amount:', correctAmount);
    return correctWallet && correctAmount;
  } catch (error) {
    console.log('Payment verification error:', error);
    return false;
  }
}

// ─── GET /health ─────────────────────────────────────────────────────────────
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    agent: 'KW PharmacyAgent',
    version: '1.0',
    wallet: process.env.PHARMACY_WALLET_ADDRESS
  });
});

// ─── POST /refill ─────────────────────────────────────────────────────────────
app.post('/refill', async (req: any, res: any) => {
  const { medication } = req.body;
  const paymentHash = req.headers['x-payment-hash'] as string;

  console.log('Refill request received:', medication);
  console.log('Payment hash:', paymentHash || 'none');

  if (!paymentHash) {
    return res.status(402).json({
      error: 'Payment required',
      price: '0.0001',
      currency: 'BTC',
      wallet: process.env.PHARMACY_WALLET_ADDRESS,
      network: 'goat-testnet3',
      chainId: 48816,
      message: 'Send 0.0001 BTC to the wallet address above, then resend with X-Payment-Hash header'
    });
  }

  console.log('Verifying payment on GOAT Network...');
  const isValid = await verifyPayment(paymentHash);

  if (!isValid) {
    return res.status(400).json({
      error: 'Payment verification failed',
      message: 'Transaction not found or incorrect amount/wallet'
    });
  }

  const medicationKey = medication?.toLowerCase().replace(/\s+/g, '');
  const medData = medications[medicationKey] || {
    name: medication,
    dosage: 'as prescribed',
    delivery: 'Tomorrow by 2pm'
  };

  console.log('Payment verified! Confirming refill...');
  res.json({
    confirmed: true,
    medication: medData.name,
    dosage: medData.dosage,
    delivery: medData.delivery,
    reference: `RX-${Date.now()}`,
    txHash: paymentHash,
    goatScanUrl: `https://explorer.testnet3.goat.network/tx/${paymentHash}`,
    message: `Your ${medData.name} refill has been confirmed. Delivery ${medData.delivery}.`
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000');
app.listen(PORT, () => {
  console.log(`PharmacyAgent running on port ${PORT}`);
  console.log(`Wallet: ${process.env.PHARMACY_WALLET_ADDRESS}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});