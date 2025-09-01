import nodemailer from 'nodemailer';
import { PAGE_URL, EMAIL_USER, EMAIL_PASS } from '../utils/config';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
  }
});

export const sendVerificationMail = async (name: string, email: string, token: string) : Promise<void> => {
  try {
    const mail = await transporter.sendMail({
      from: `"NexoNow" <${EMAIL_USER}>`,
      to: email,
      subject: "Verifica tu cuenta",
      text: `Hola ${name}, verifica tu cuenta aquí: ${PAGE_URL}/verify/${token}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #0078D4;">¡Hola ${name}!</h2>
          <p>
            Tu cuenta de NexoNow ha sido creada correctamente. Solo debes hacer click en el botón para verificarla:
          </p>
          <a href="${PAGE_URL}/verify/${token}" style="display: inline-block; padding: 10px 20px; background-color: #0078D4; color: white; text-decoration: none; border-radius: 5px;">
            Verificar Cuenta
          </a>
          <p>
            Si no creaste esta cuenta, simplemente ignora este correo.
          </p> 
        </div>
      `
    });
    console.log('Correo enviado', mail.messageId);
  }
  catch(error) {
    console.log('Error al enviar el correo:', error);
  }
}