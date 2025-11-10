import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Sharing from 'expo-sharing';
import { Transaction, Recipient } from '@/types/database';
import { formatCurrency } from '@/services/exchange-service';

interface GeneratePDFParams {
  transaction: Transaction;
  recipient: Recipient | undefined;
  userName: string;
}

const generateHTMLReceipt = (params: GeneratePDFParams): string => {
  const { transaction, recipient, userName } = params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          padding: 40px 20px;
          color: #ffffff;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #1a1a1a;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(163, 230, 53, 0.15);
        }

        .header {
          background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #000000;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .checkmark {
          width: 40px;
          height: 40px;
          border: 4px solid #a3e635;
          border-radius: 50%;
          position: relative;
        }

        .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #a3e635;
          font-size: 28px;
          font-weight: bold;
        }

        .header h1 {
          color: #000000;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .header p {
          color: rgba(0, 0, 0, 0.7);
          font-size: 16px;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        .content {
          padding: 30px;
        }

        .reference {
          text-align: center;
          padding: 20px;
          background: rgba(163, 230, 53, 0.1);
          border-radius: 16px;
          margin-bottom: 30px;
          border: 2px solid rgba(163, 230, 53, 0.2);
        }

        .reference-label {
          color: #999999;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .reference-value {
          color: #a3e635;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .amount-section {
          background: linear-gradient(135deg, #262626 0%, #1a1a1a 100%);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 25px;
          border: 1px solid #333333;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #333333;
        }

        .amount-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .amount-label {
          color: #999999;
          font-size: 14px;
          font-weight: 500;
        }

        .amount-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
        }

        .total-row {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #333333;
        }

        .total-label {
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
        }

        .total-value {
          color: #ffffff;
          font-size: 18px;
          font-weight: 800;
        }

        .receive-box {
          background: linear-gradient(135deg, rgba(163, 230, 53, 0.15) 0%, rgba(163, 230, 53, 0.05) 100%);
          border: 2px solid rgba(163, 230, 53, 0.3);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          margin-top: 20px;
        }

        .receive-label {
          color: #a3e635;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .receive-value {
          color: #a3e635;
          font-size: 36px;
          font-weight: 800;
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333333;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #2a2a2a;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #999999;
          font-size: 14px;
          font-weight: 500;
        }

        .info-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
          max-width: 60%;
        }

        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #333333, transparent);
          margin: 30px 0;
        }

        .footer {
          background: #262626;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #333333;
        }

        .footer-text {
          color: #666666;
          font-size: 12px;
          line-height: 1.6;
        }

        .brand {
          color: #a3e635;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 8px;
          display: block;
        }

        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(163, 230, 53, 0.2);
          color: #a3e635;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">
            <div class="checkmark"></div>
          </div>
          <h1>Payment Successful!</h1>
          <p>Your money is on its way</p>
          <span class="status-badge">${transaction.status}</span>
        </div>

        <div class="content">
          <div class="reference">
            <div class="reference-label">Reference Number</div>
            <div class="reference-value">${transaction.reference_number}</div>
          </div>

          <div class="amount-section">
            <div class="amount-row">
              <span class="amount-label">You sent</span>
              <span class="amount-value">${formatCurrency(transaction.send_amount, transaction.from_currency)}</span>
            </div>

            <div class="amount-row">
              <span class="amount-label">Exchange rate</span>
              <span class="amount-value">1 ${transaction.from_currency} = ${transaction.exchange_rate.toFixed(4)} ${transaction.to_currency}</span>
            </div>

            <div class="amount-row">
              <span class="amount-label">Transfer fee</span>
              <span class="amount-value">${formatCurrency(transaction.fee_amount, transaction.from_currency)}</span>
            </div>

            <div class="amount-row total-row">
              <span class="total-label">Total paid</span>
              <span class="total-value">${formatCurrency(transaction.total_amount, transaction.from_currency)}</span>
            </div>

            <div class="receive-box">
              <div class="receive-label">Recipient receives</div>
              <div class="receive-value">${formatCurrency(transaction.receive_amount, transaction.to_currency)}</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2 class="section-title">Sender Information</h2>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${userName}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2 class="section-title">Recipient Information</h2>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${recipient?.full_name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Country</span>
              <span class="info-value">${recipient?.country || 'N/A'}</span>
            </div>
            ${recipient?.bank_name ? `
            <div class="info-row">
              <span class="info-label">Bank</span>
              <span class="info-value">${recipient.bank_name}</span>
            </div>
            ` : ''}
            ${recipient?.mobile_money_provider ? `
            <div class="info-row">
              <span class="info-label">Provider</span>
              <span class="info-value">${recipient.mobile_money_provider}</span>
            </div>
            ` : ''}
            ${recipient?.account_number ? `
            <div class="info-row">
              <span class="info-label">Account</span>
              <span class="info-value">${recipient.account_number}</span>
            </div>
            ` : ''}
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2 class="section-title">Delivery Details</h2>
            <div class="info-row">
              <span class="info-label">Method</span>
              <span class="info-value">${transaction.delivery_method?.replace('_', ' ') || 'Bank Transfer'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date</span>
              <span class="info-value">${formatDate(transaction.created_at)}</span>
            </div>
            ${transaction.estimated_arrival ? `
            <div class="info-row">
              <span class="info-label">Expected arrival</span>
              <span class="info-value">${formatDate(transaction.estimated_arrival)}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="footer">
          <span class="brand">RemitPay</span>
          <p class="footer-text">
            Thank you for your transfer!<br>
            Keep this receipt for your records.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateAndSharePDF = async (params: GeneratePDFParams): Promise<void> => {
  try {
    const html = generateHTMLReceipt(params);

    const options = {
      html,
      fileName: `receipt_${params.transaction.reference_number}`,
      directory: 'Documents',
      base64: false,
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (file.filePath) {
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(file.filePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Receipt',
          UTI: 'public.pdf',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
