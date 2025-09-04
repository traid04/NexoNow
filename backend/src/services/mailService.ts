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

export const sendVerificationMail = async (name: string, email: string, token: string, firstSend: boolean) : Promise<void> => {
  try {
    let message: string;
    let title: string;
    if (firstSend) {
      message = 'Tu cuenta de NexoNow ha sido creada correctamente. Solo debes hacer click en el botón para verificarla (Válido por un día):';
      title = 'Verifica tu cuenta';
    }
    else {
      message = 'Parece que tu enlace anterior ha expirado. Haz click en el siguiente botón para verificar tu cuenta (Válido por un día):';
      title = 'Reenvío de Token';
    }
    const mail = await transporter.sendMail({
      from: `"NexoNow" <${EMAIL_USER}>`,
      to: email,
      subject: `${title}`,
      text: `Hola ${name}, verifica tu cuenta aquí: ${PAGE_URL}/api/users/verify/${token}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #0078D4;">¡Hola ${name}!</h2>
          <p>
            ${message}
          </p>
          <a href="${PAGE_URL}/api/users/verify/${token}" style="display: inline-block; padding: 10px 20px; background-color: #0078D4; color: white; text-decoration: none; border-radius: 5px;">
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

export const sendChangeMail = async (name: string, email: string, token: string, message: string) : Promise<void> => {
  let title;
  let msg;
  let url;
  let change;
  if (message === 'changeEmail') {
    title = 'Confirma tu cambio de dirección de Email';
    msg = 'Nos ha llegado tu solicitud para cambiar la dirección de Email asociada a tu cuenta. Haz click en el siguiente botón para confirmar tu elección (Válido por 10 minutos):';
    url = 'change-email';
    change = 'email';
  }
  if (message === 'changePassword') {
    title = 'Confirma tu cambio de Contraseña';
    msg = 'Nos ha llegado tu solicitud para cambiar la contraseña de tu cuenta. Haz click en el siguiente botón para confirmar tu elección (Válido por 10 minutos):';
    url = 'change-password';
    change = 'contraseña';
  }
  try {
    const mail = await transporter.sendMail({
      from: `"NexoNow" <${EMAIL_USER}>`,
      to: email,
      subject: `${title}`,
      text: `Hola ${name}, confirma tu cambio de ${change} aquí: ${PAGE_URL}/api/users/me/${url}/${token}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #0078D4;">¡Hola ${name}!</h2>
          <p>
            ${msg}
          </p>
          <a href="${PAGE_URL}/api/users/me/${url}/${token}" style="display: inline-block; padding: 10px 20px; background-color: #0078D4; color: white; text-decoration: none; border-radius: 5px;">
            Confirmar Cambio
          </a>
          <p>
            Si no solicitaste este cambio, simplemente ignora este correo.
          </p>
        </div>
      `
    });
    console.log('Correo enviado', mail.messageId);
  }
  catch(error) {
    console.log('Error al enviar el correo: ', error);
  }
}