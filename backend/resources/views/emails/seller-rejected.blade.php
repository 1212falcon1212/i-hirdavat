<!DOCTYPE html>
<html lang="tr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Başvuru Durumu — i-hırdavat</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdfa; color: #1a1a1a; }
    </style>
</head>

<body style="margin:0;padding:0;background-color:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;font-size:1px;color:#f0fdfa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        i-hırdavat üyelik başvurunuz hakkında bilgilendirme. Lütfen detayları inceleyiniz.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0fdfa;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background:linear-gradient(135deg,#0390b1,#027a96);padding:40px 40px 32px;border-radius:16px 16px 0 0;">
                            <h1 style="margin:0 0 6px;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">i-hırdavat</h1>
                            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:400;">Başvuru Durumu</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

                            <!-- Info Icon -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom:24px;">
                                        <div style="width:64px;height:64px;border-radius:50%;background:#fef3c7;display:inline-block;line-height:64px;text-align:center;font-size:28px;">
                                            &#128221;
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a1a;">
                                Sayın {{ $user->seller_name }},
                            </h2>

                            <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#6b7280;">
                                i-hırdavat üyelik başvurunuz incelendi.
                            </p>
                            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#6b7280;">
                                Maalesef başvurunuz şu an için onaylanamamıştır. Aşağıdaki sebeplerden dolayı başvurunuzu yeniden değerlendirmemiz gerekmektedir:
                            </p>

                            <!-- Rejection Reason -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                                <tr>
                                    <td style="background:#fef3c7;border:1px solid #fde68a;border-left:4px solid #d97706;border-radius:0 12px 12px 0;padding:20px 24px;">
                                        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Değerlendirme Notu</p>
                                        <p style="margin:0;font-size:15px;line-height:1.7;color:#92400e;">
                                            {{ $reason }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                                <tr>
                                    <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;">
                                        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a1a1a;">Ne yapabilirsiniz?</p>
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding:6px 0;font-size:14px;color:#6b7280;line-height:1.6;">
                                                    &#8226;&nbsp; Eksik belgeleri tamamlayarak yeniden başvurabilirsiniz
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;font-size:14px;color:#6b7280;line-height:1.6;">
                                                    &#8226;&nbsp; Detaylı bilgi için destek ekibimize ulaşabilirsiniz
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;font-size:14px;color:#6b7280;line-height:1.6;">
                                                    &#8226;&nbsp; Başvurunuz hakkında soru sormak için bize yazabilirsiniz
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Contact CTA -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding:8px 0 24px;">
                                        <a href="mailto:info@i-hirdavat.com" style="display:inline-block;background:#0390b1;color:#ffffff;padding:16px 40px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                                            Bize Ulaşın
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;font-size:14px;line-height:1.6;color:#9ca3af;text-align:center;">
                                E-posta: <a href="mailto:info@i-hirdavat.com" style="color:#0390b1;text-decoration:none;font-weight:600;">info@i-hirdavat.com</a>
                            </p>

                            <!-- Divider -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr><td style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:24px;"></td></tr>
                            </table>

                            <p style="margin:0;font-size:15px;line-height:1.7;color:#6b7280;">
                                Saygılarımızla,<br>
                                <strong style="color:#1a1a1a;">i-hırdavat Ekibi</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f9fafb;padding:24px 40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;font-weight:600;">
                                <a href="https://i-hirdavat.com" style="color:#0390b1;text-decoration:none;">i-hirdavat.com</a>
                            </p>
                            <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;">
                                Türkiye'nin İlk Komisyonsuz B2B Hırdavat Pazaryeri
                            </p>
                            <p style="margin:0;font-size:11px;color:#d1d5db;">
                                Bu e-posta otomatik olarak gönderilmiştir. Yanıtlamayınız.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
