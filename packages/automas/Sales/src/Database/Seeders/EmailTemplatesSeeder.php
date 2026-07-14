<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;
use App\Models\EmailTemplateLang;
use App\Models\User;

class EmailTemplatesSeeder extends Seeder
{
    public function run()
    {
        $admin = User::where('type','company')->first();

        $emailTemplate = [
            'Create Meeting',
            'Create Account',
            'Create Opportunity',
            'Opportunity Move',
            'Create Quote',
            'Quote Status Update',
            'Create Sales Order',
            'Sales Order Status Update',
            'Create Contact',
        ];
        $defaultTemplate = [
            'Create Meeting' => [
                'subject' => 'Meeting Scheduled',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Meeting Title": "meeting_title",
                    "Meeting Date": "meeting_date",
                    "Meeting Time": "meeting_time",
                    "Meeting Location": "meeting_location",
                    "Meeting Description": "meeting_description",
                    "Organizer Name": "organizer_name",
                    "Attendees List": "attendees_list"
                }',
                'lang' => [
                'ar' => '<div dir="rtl" style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                تم جدولة الاجتماع بنجاح
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                تم تنظيم اجتماع جديد لك
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                مرحبًا،
                </p>

                <p>
                لقد تمت دعوتك لحضور اجتماع بواسطة 
                <strong>{organizer_name}</strong>
                من
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 تاريخ الاجتماع
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ وقت الاجتماع
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 الموقع
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 المنظم
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 الحضور
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 وصف الاجتماع
                </div>

                <div style="background:#f9fafb;border-right:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                يرجى التأكد من الانضمام إلى الاجتماع في الوقت المحدد. نتطلع إلى حضورك ومشاركتك القيمة.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                افتح {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                مع أطيب التحيات،<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'da' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Mødet er planlagt
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Et nyt møde er blevet arrangeret til dig
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Hej,
                </p>

                <p>
                Du er blevet inviteret til et møde af 
                <strong>{organizer_name}</strong> fra 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Mødedato
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Mødetid
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Lokation
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Arrangør
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Deltagere
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Mødebeskrivelse
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Sørg venligst for at deltage i mødet til tiden. Vi ser frem til din deltagelse.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Åbn {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Med venlig hilsen,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'de' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Meeting erfolgreich geplant
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Ein neues Meeting wurde für Sie organisiert
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Hallo,
                </p>

                <p>
                Sie wurden von 
                <strong>{organizer_name}</strong> von 
                <strong>{company_name}</strong> zu einem Meeting eingeladen.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Meeting-Datum
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Meeting-Zeit
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Ort
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organisator
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Teilnehmer
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Meeting-Beschreibung
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Bitte stellen Sie sicher, dass Sie pünktlich am Meeting teilnehmen. Wir freuen uns auf Ihre Teilnahme.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                {app_name} öffnen
                </a>
                </div>

                <p style="margin-top:35px;">
                Mit freundlichen Grüßen,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                                    'en' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:32px;margin-bottom:10px;"></div>
                <div style="font-size:28px;font-weight:700;">
                Meeting Scheduled Successfully
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                A new meeting has been organized for you
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Hello,
                </p>

                <p>
                You have been invited to attend a meeting by 
                <strong>{organizer_name}</strong> from 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Meeting Date
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Meeting Time
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Location
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizer
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Attendees
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Meeting Description
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Please make sure to join the meeting on time. We look forward to your valuable presence and participation.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Open {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Best regards,<br>
                <strong>{company_name}</strong>
                </p>
                </div>
                </div>
                </div>
                </div>',

                                    'es' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Reunión programada con éxito
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Se ha organizado una nueva reunión para usted
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Hola,
                </p>

                <p>
                Ha sido invitado a una reunión por 
                <strong>{organizer_name}</strong> de 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Fecha de la reunión
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Hora de la reunión
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Ubicación
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizador
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Asistentes
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Descripción de la reunión
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Por favor, asegúrese de unirse a la reunión a tiempo. Esperamos contar con su valiosa presencia y participación.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Abrir {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Saludos cordiales,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'fr' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Réunion planifiée avec succès
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Une nouvelle réunion a été organisée pour vous
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Bonjour,
                </p>

                <p>
                Vous avez été invité à une réunion par 
                <strong>{organizer_name}</strong> de 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Date de la réunion
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Heure de la réunion
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Lieu
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organisateur
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Participants
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Description de la réunion
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Veuillez vous assurer de rejoindre la réunion à temps. Nous attendons avec impatience votre présence et votre participation.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Ouvrir {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Cordialement,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'it' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Riunione programmata con successo
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                È stata organizzata una nuova riunione per te
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Ciao,
                </p>

                <p>
                Sei stato invitato a una riunione da 
                <strong>{organizer_name}</strong> di 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Data della riunione
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Ora della riunione
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Luogo
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizzatore
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Partecipanti
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Descrizione della riunione
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Assicurati di partecipare alla riunione in orario. Non vediamo l\'ora della tua presenza e partecipazione.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Apri {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Cordiali saluti,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                                    'ja' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                ミーティングが正常に予定されました
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                新しいミーティングがあなたのために作成されました
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                こんにちは、
                </p>

                <p>
                <strong>{company_name}</strong> の 
                <strong>{organizer_name}</strong> より、ミーティングへの招待があります。
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 ミーティング日
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ ミーティング時間
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 場所
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 主催者
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 参加者
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 ミーティング説明
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                時間通りにミーティングへご参加ください。皆様のご参加をお待ちしております。
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                {app_name} を開く
                </a>
                </div>

                <p style="margin-top:35px;">
                よろしくお願いいたします。<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'nl' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Vergadering succesvol gepland
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Er is een nieuwe vergadering voor u georganiseerd
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Hallo,
                </p>

                <p>
                U bent uitgenodigd voor een vergadering door 
                <strong>{organizer_name}</strong> van 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Vergaderdatum
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Vergadertijd
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Locatie
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organisator
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Deelnemers
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Vergaderbeschrijving
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Zorg ervoor dat u op tijd deelneemt aan de vergadering. We kijken uit naar uw aanwezigheid en deelname.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Open {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Met vriendelijke groet,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'pl' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Spotkanie zostało pomyślnie zaplanowane
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Nowe spotkanie zostało zorganizowane dla Ciebie
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Witaj,
                </p>

                <p>
                Zostałeś zaproszony na spotkanie przez 
                <strong>{organizer_name}</strong> z firmy 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Data spotkania
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Godzina spotkania
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Lokalizacja
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizator
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Uczestnicy
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Opis spotkania
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Prosimy o dołączenie do spotkania na czas. Czekamy na Twoją obecność i udział.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Otwórz {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Z poważaniem,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                                    'ru' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Встреча успешно запланирована
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Для вас была организована новая встреча
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Здравствуйте,
                </p>

                <p>
                Вы были приглашены на встречу организатором 
                <strong>{organizer_name}</strong> из компании 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Дата встречи
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Время встречи
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Место проведения
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Организатор
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Участники
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Описание встречи
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Пожалуйста, присоединяйтесь к встрече вовремя. Мы будем рады вашему участию.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Открыть {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                С уважением,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'pt' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Reunião agendada com sucesso
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Uma nova reunião foi organizada para você
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Olá,
                </p>

                <p>
                Você foi convidado para uma reunião por 
                <strong>{organizer_name}</strong> da 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Data da reunião
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Horário da reunião
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Localização
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizador
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Participantes
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Descrição da reunião
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Por favor, certifique-se de participar da reunião no horário marcado. Esperamos sua presença e participação.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Abrir {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Atenciosamente,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                                    'pt-BR' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Reunião agendada com sucesso
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Uma nova reunião foi organizada para você
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Olá,
                </p>

                <p>
                Você foi convidado para uma reunião por 
                <strong>{organizer_name}</strong> da 
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Data da reunião
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Horário da reunião
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Localização
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizador
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Participantes
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Descrição da reunião
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Por favor, certifique-se de participar da reunião no horário marcado. Esperamos sua presença e participação.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                Abrir {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                Atenciosamente,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                                    'tr' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                Toplantı Başarıyla Planlandı
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                Sizin için yeni bir toplantı oluşturuldu
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                Merhaba,
                </p>

                <p>
                <strong>{company_name}</strong> şirketinden 
                <strong>{organizer_name}</strong> tarafından bir toplantıya davet edildiniz.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 Toplantı Tarihi
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ Toplantı Saati
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 Konum
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 Organizatör
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 Katılımcılar
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 Toplantı Açıklaması
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                Lütfen toplantıya zamanında katıldığınızdan emin olun. Katılımınızı bekliyoruz.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                {app_name} Aç
                </a>
                </div>

                <p style="margin-top:35px;">
                Saygılarımızla,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'zh' => '<div style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                会议已成功安排
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                已为您安排新的会议
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                您好，
                </p>

                <p>
                您已收到来自 
                <strong>{company_name}</strong> 的 
                <strong>{organizer_name}</strong> 发出的会议邀请。
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 会议日期
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ 会议时间
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 会议地点
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 组织者
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 参会人员
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 会议描述
                </div>

                <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                请确保准时参加会议。期待您的参与。
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                打开 {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                此致敬礼，<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',

                'he' => '<div dir="rtl" style="font-family:Segoe UI,Arial,Helvetica,sans-serif;background:#f3f5fb;padding:40px 20px;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);">

                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:35px 30px;text-align:center;color:#ffffff;">
                <div style="font-size:28px;font-weight:700;">
                הפגישה נקבעה בהצלחה
                </div>
                <div style="margin-top:10px;font-size:15px;color:#e0e7ff;">
                פגישה חדשה אורגנה עבורך
                </div>
                </div>

                <div style="padding:35px 30px;color:#333333;font-size:15px;line-height:1.8;">

                <p style="margin-top:0;">
                שלום,
                </p>

                <p>
                הוזמנת לפגישה על ידי 
                <strong>{organizer_name}</strong> מ־
                <strong>{company_name}</strong>.
                </p>

                <div style="background:#f8f9ff;border:1px solid #e6e8f0;border-radius:14px;padding:25px;margin:30px 0;">

                <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:25px;">
                📌 {meeting_title}
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:2;">

                <tr>
                <td style="font-weight:600;color:#4b5563;width:180px;">
                📅 תאריך הפגישה
                </td>
                <td style="color:#111827;">
                {meeting_date}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                ⏰ שעת הפגישה
                </td>
                <td style="color:#111827;">
                {meeting_time}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                📍 מיקום
                </td>
                <td style="color:#111827;">
                {meeting_location}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;">
                👤 מארגן
                </td>
                <td style="color:#111827;">
                {organizer_name}
                </td>
                </tr>

                <tr>
                <td style="font-weight:600;color:#4b5563;vertical-align:top;">
                👥 משתתפים
                </td>
                <td style="color:#111827;">
                {attendees_list}
                </td>
                </tr>

                </table>

                </div>

                <div style="margin-top:25px;">

                <div style="font-size:18px;font-weight:600;color:#111827;margin-bottom:12px;">
                📝 תיאור הפגישה
                </div>

                <div style="background:#f9fafb;border-right:4px solid #6366f1;padding:18px;border-radius:10px;color:#4b5563;line-height:1.8;">
                {meeting_description}
                </div>

                </div>

                <p style="margin-top:30px;">
                אנא ודא/י שאתה מצטרף לפגישה בזמן. אנו מצפים להשתתפותך.
                </p>

                <div style="margin:35px 0;text-align:center;">
                <a href="{app_url}" 
                style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                פתח את {app_name}
                </a>
                </div>

                <p style="margin-top:35px;">
                בברכה,<br>
                <strong>{company_name}</strong>
                </p>

                </div>
                </div>
                </div>',
                ],
            ],

            'Create Account' => [
                'subject' => 'Account Created',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Account Name": "account_name",
                    "Account Email": "account_email",
                    "Account Phone": "account_phone",
                    "Account Website": "account_website",
                    "Account Type": "account_type",
                    "Account Industry": "account_industry",
                    "Billing Address": "billing_address",
                    "Billing City": "billing_city",
                    "Billing State": "billing_state",
                    "Billing Country": "billing_country",
                    "Billing Postal Code": "billing_postal_code",
                    "Description": "account_description",
                    "Assigne User": "assigned_user",
                    "Create By": "created_by"
                }',
                'lang' => [
                    'ar' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;direction:rtl;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <!-- Header -->

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        تم إنشاء الحساب بنجاح
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        تمت إضافة حساب أعمال جديد بنجاح إلى مساحة عمل CRM الخاصة بك.
                        </div>

                        </div>

                        <!-- Body -->

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        مرحباً،
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        تم إنشاء حساب جديد في 
                        <strong style="color:#111827;">{company_name}</strong> بواسطة 
                        <strong style="color:#111827;">{created_by}</strong> وتم تعيينه إلى 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <!-- Account Card -->

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        معلومات الحساب
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 بريد الحساب الإلكتروني
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 هاتف الحساب
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 الموقع الإلكتروني
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ نوع الحساب
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 المجال
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ تم الإنشاء بواسطة
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 عنوان الفواتير
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 وصف الحساب
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        افتح {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        تم حفظ تفاصيل الحساب بأمان وهي متاحة الآن داخل لوحة تحكم CRM الخاصة بك.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        مع أطيب التحيات،<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'da' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Konto Oprettet
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        En ny virksomhedskonto er blevet tilføjet til dit CRM-arbejdsområde.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hej,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        En ny konto er blevet oprettet i 
                        <strong style="color:#111827;">{company_name}</strong> af 
                        <strong style="color:#111827;">{created_by}</strong> og tildelt til 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Kontooplysninger
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 KONTO EMAIL
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 KONTO TELEFON
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 HJEMMESIDE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ KONTOTYPE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDUSTRI
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ OPRETTET AF
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Faktureringsadresse
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Kontobeskrivelse
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Åbn {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Kontodetaljerne er nu sikkert gemt og tilgængelige i dit CRM-dashboard.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Med venlig hilsen,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'de' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Konto Erfolgreich Erstellt
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Ein neues Geschäftskonto wurde erfolgreich zu Ihrem CRM-Arbeitsbereich hinzugefügt.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hallo,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Ein neues Konto wurde in 
                        <strong style="color:#111827;">{company_name}</strong> von 
                        <strong style="color:#111827;">{created_by}</strong> erstellt und 
                        <strong style="color:#111827;">{assigned_user}</strong> zugewiesen.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Kontoinformationen
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 KONTO E-MAIL
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 KONTO TELEFON
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 WEBSEITE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ KONTO TYP
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 BRANCHE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ ERSTELLT VON
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Rechnungsadresse
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Kontobeschreibung
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        {app_name} Öffnen

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Die Kontodaten wurden sicher gespeichert und sind jetzt in Ihrem CRM-Dashboard verfügbar.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Mit freundlichen Grüßen,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',

                    'en' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Account Created Successfully
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        A new business account has been successfully added to your CRM workspace.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hello,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        A new account has been created in 
                        <strong style="color:#111827;">{company_name}</strong> by 
                        <strong style="color:#111827;">{created_by}</strong> and assigned to 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <!-- Account Card -->

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Account Information
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 ACCOUNT EMAIL
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 ACCOUNT PHONE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 WEBSITE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ ACCOUNT TYPE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDUSTRY
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ CREATED BY
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Billing Address
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Account Description
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Open {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        The account details have been securely stored and are now accessible within your CRM dashboard.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Best regards,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',

                    'es' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Cuenta Creada Exitosamente
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Una nueva cuenta empresarial ha sido agregada exitosamente a su espacio de trabajo CRM.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hola,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Se ha creado una nueva cuenta en 
                        <strong style="color:#111827;">{company_name}</strong> por 
                        <strong style="color:#111827;">{created_by}</strong> y asignada a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Información de la Cuenta
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 CORREO ELECTRÓNICO
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 TELÉFONO
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 SITIO WEB
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ TIPO DE CUENTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDUSTRIA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ CREADO POR
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Dirección de Facturación
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Descripción de la Cuenta
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Abrir {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Los detalles de la cuenta han sido almacenados de forma segura y ahora están disponibles en su panel CRM.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Saludos cordiales,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'fr' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Compte Créé Avec Succès
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Un nouveau compte professionnel a été ajouté avec succès à votre espace de travail CRM.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Bonjour,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Un nouveau compte a été créé dans 
                        <strong style="color:#111827;">{company_name}</strong> par 
                        <strong style="color:#111827;">{created_by}</strong> et attribué à 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Informations du Compte
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 EMAIL DU COMPTE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 TÉLÉPHONE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 SITE WEB
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ TYPE DE COMPTE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDUSTRIE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ CRÉÉ PAR
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Adresse de Facturation
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Description du Compte
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Ouvrir {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Les détails du compte ont été enregistrés en toute sécurité et sont maintenant accessibles dans votre tableau de bord CRM.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Cordialement,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'it' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Account Creato con Successo
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Un nuovo account aziendale è stato aggiunto con successo al tuo spazio di lavoro CRM.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Ciao,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Un nuovo account è stato creato in 
                        <strong style="color:#111827;">{company_name}</strong> da 
                        <strong style="color:#111827;">{created_by}</strong> ed assegnato a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Informazioni Account
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 EMAIL ACCOUNT
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 TELEFONO
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 SITO WEB
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ TIPO ACCOUNT
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 SETTORE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ CREATO DA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Indirizzo di Fatturazione
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Descrizione Account
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Apri {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        I dettagli dell\'account sono stati archiviati in modo sicuro e sono ora accessibili nella dashboard CRM.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Cordiali saluti,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',

                    'ja' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        アカウントが正常に作成されました
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        新しいビジネスアカウントがCRMワークスペースに正常に追加されました。
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        こんにちは、
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        <strong style="color:#111827;">{company_name}</strong> に新しいアカウントが 
                        <strong style="color:#111827;">{created_by}</strong> によって作成され、
                        <strong style="color:#111827;">{assigned_user}</strong> に割り当てられました。
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        アカウント情報
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 アカウントメール
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 アカウント電話番号
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 ウェブサイト
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ アカウントタイプ
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 業種
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ 作成者
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 請求先住所
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 アカウント説明
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        {app_name} を開く

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        アカウント情報は安全に保存され、CRMダッシュボードからアクセス可能になりました。
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        よろしくお願いいたします。<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'nl' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Account Succesvol Aangemaakt
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Een nieuw bedrijfsaccount is succesvol toegevoegd aan uw CRM-werkruimte.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hallo,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Er is een nieuw account aangemaakt in 
                        <strong style="color:#111827;">{company_name}</strong> door 
                        <strong style="color:#111827;">{created_by}</strong> en toegewezen aan 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Accountinformatie
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 ACCOUNT E-MAIL
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 ACCOUNT TELEFOON
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 WEBSITE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ ACCOUNTTYPE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDUSTRIE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ GEMAAKT DOOR
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Factuuradres
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Accountbeschrijving
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Open {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        De accountgegevens zijn veilig opgeslagen en zijn nu toegankelijk via uw CRM-dashboard.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Met vriendelijke groet,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'pl' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Konto Utworzone Pomyślnie
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Nowe konto firmowe zostało pomyślnie dodane do Twojego obszaru roboczego CRM.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Witaj,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Nowe konto zostało utworzone w 
                        <strong style="color:#111827;">{company_name}</strong> przez 
                        <strong style="color:#111827;">{created_by}</strong> i przypisane do 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Informacje o Koncie
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 EMAIL KONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 TELEFON KONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 STRONA INTERNETOWA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ TYP KONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 BRANŻA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ UTWORZONE PRZEZ
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Adres Rozliczeniowy
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Opis Konta
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Otwórz {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Szczegóły konta zostały bezpiecznie zapisane i są teraz dostępne w panelu CRM.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Z poważaniem,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',

                    'ru' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Аккаунт Успешно Создан
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Новый бизнес-аккаунт был успешно добавлен в ваше CRM-пространство.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Здравствуйте,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Новый аккаунт был создан в 
                        <strong style="color:#111827;">{company_name}</strong> пользователем 
                        <strong style="color:#111827;">{created_by}</strong> и назначен 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Информация об Аккаунте
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 EMAIL АККАУНТА
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 ТЕЛЕФОН
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 ВЕБ-САЙТ
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ ТИП АККАУНТА
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 ОТРАСЛЬ
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ СОЗДАНО
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Платежный Адрес
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Описание Аккаунта
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Открыть {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Данные аккаунта были безопасно сохранены и теперь доступны в вашей CRM-панели.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        С уважением,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'pt' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Conta Criada com Sucesso
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Uma nova conta empresarial foi adicionada com sucesso ao seu espaço de trabalho CRM.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Olá,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Uma nova conta foi criada em 
                        <strong style="color:#111827;">{company_name}</strong> por 
                        <strong style="color:#111827;">{created_by}</strong> e atribuída a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Informações da Conta
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 EMAIL DA CONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 TELEFONE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 WEBSITE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ TIPO DE CONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDÚSTRIA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ CRIADO POR
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Endereço de Cobrança
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Descrição da Conta
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Abrir {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Os detalhes da conta foram armazenados com segurança e agora estão acessíveis no seu painel CRM.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Atenciosamente,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',

                    'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Conta Criada com Sucesso
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Uma nova conta empresarial foi adicionada com sucesso ao seu espaço de trabalho CRM.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Olá,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Uma nova conta foi criada em 
                        <strong style="color:#111827;">{company_name}</strong> por 
                        <strong style="color:#111827;">{created_by}</strong> e atribuída a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Informações da Conta
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 EMAIL DA CONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 TELEFONE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 WEBSITE
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ TIPO DE CONTA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 INDÚSTRIA
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ CRIADO POR
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Endereço de Cobrança
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Descrição da Conta
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        Abrir {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Os detalhes da conta foram armazenados com segurança e agora estão acessíveis no seu painel CRM.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Atenciosamente,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',

                    'tr' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        Hesap Başarıyla Oluşturuldu
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        Yeni bir işletme hesabı CRM çalışma alanınıza başarıyla eklendi.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Merhaba,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        <strong style="color:#111827;">{company_name}</strong> içinde yeni bir hesap 
                        <strong style="color:#111827;">{created_by}</strong> tarafından oluşturuldu ve 
                        <strong style="color:#111827;">{assigned_user}</strong> kullanıcısına atandı.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        Hesap Bilgileri
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 HESAP E-POSTASI
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 HESAP TELEFONU
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 WEB SİTESİ
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ HESAP TÜRÜ
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 SEKTÖR
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ OLUŞTURAN
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 Fatura Adresi
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 Hesap Açıklaması
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        {app_name} Aç

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        Hesap bilgileri güvenli bir şekilde saklandı ve artık CRM panelinizden erişilebilir.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        Saygılarımızla,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'zh' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        账户创建成功
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        新的企业账户已成功添加到您的 CRM 工作区。
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        您好，
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        一个新的账户已在 
                        <strong style="color:#111827;">{company_name}</strong> 中由 
                        <strong style="color:#111827;">{created_by}</strong> 创建，并分配给 
                        <strong style="color:#111827;">{assigned_user}</strong>。
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        账户信息
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 账户邮箱
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 账户电话
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 网站
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ 账户类型
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 行业
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ 创建者
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 账单地址
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 账户描述
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        打开 {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        账户详细信息已安全存储，现在可以在您的 CRM 仪表板中访问。
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        此致敬礼，<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',


                    'he' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;direction:rtl;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%);padding:45px 35px;text-align:center;position:relative;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                        החשבון נוצר בהצלחה
                        </div>

                        <div style="margin-top:12px;font-size:16px;color:#e0e7ff;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.7;">
                        חשבון עסקי חדש נוסף בהצלחה לסביבת העבודה של ה-CRM שלך.
                        </div>

                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        שלום,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        חשבון חדש נוצר ב- 
                        <strong style="color:#111827;">{company_name}</strong> על ידי 
                        <strong style="color:#111827;">{created_by}</strong> והוקצה ל- 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8faff,#ffffff);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8faff;">

                        <div style="font-size:14px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                        פרטי החשבון
                        </div>

                        <div style="margin-top:10px;font-size:28px;font-weight:700;color:#111827;">
                        {account_name}
                        </div>

                        </div>

                        <div style="padding:28px;">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📧 אימייל החשבון
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_email}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        📞 טלפון החשבון
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_phone}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🌐 אתר אינטרנט
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_website}
                        </div>
                        </td>

                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏷️ סוג החשבון
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_type}
                        </div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🏭 תעשייה
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {account_industry}
                        </div>
                        </td>

                        <tr>
                        <td colspan="2" style="padding:12px 0;vertical-align:top;">
                        <div style="font-size:13px;color:#6b7280;font-weight:600;">
                        🛠️ נוצר על ידי
                        </div>
                        <div style="margin-top:6px;font-size:15px;color:#111827;">
                        {created_by}
                        </div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📍 כתובת לחיוב
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:2;">
                        <div>{billing_address}</div>
                        <div>{billing_city}, {billing_state}</div>
                        <div>{billing_country} - {billing_postal_code}</div>
                        </div>

                        </div>

                        <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:18px;padding:26px;">

                        <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                        📝 תיאור החשבון
                        </div>

                        <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                        {account_description}
                        </div>
                        </div>

                        <div style="margin-top:40px;text-align:center;">

                        <a href="{app_url}" 
                        style="display:inline-block;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:14px;font-size:15px;font-weight:600;box-shadow:0 8px 20px rgba(99,102,241,0.35);">

                        פתח את {app_name}

                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                        פרטי החשבון נשמרו בצורה מאובטחת וכעת זמינים בלוח הבקרה של ה-CRM שלך.
                        </p>

                        <p style="margin-top:30px;font-size:15px;color:#374151;">
                        בברכה,<br>
                        <strong>{company_name}</strong>
                        </p>
                        </div>
                        </div>
                        </div>',
                ],
            ],

            'Create Opportunity' => [
                'subject' => 'New Opportunity Created',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Opportunity Name": "opportunity_name",
                    "Opportunity Amount": "opportunity_amount",
                    "Opportunity Expected Amount": "opportunity_expected_amount",
                    "Opportunity Probability": "opportunity_probability",
                    "Opportunity Close Date": "opportunity_close_date",
                    "Opportunity Next Followup Date": "opportunity_next_followup_date",
                    "Opportunity Lead Source": "opportunity_lead_source",
                    "Opportunity Next Step": "opportunity_next_step",
                    "Opportunity Description": "opportunity_description",
                    "Opportunity Account": "opportunity_account",
                    "Opportunity Contact": "opportunity_contact",
                    "Opportunity Stage": "opportunity_stage",
                    "Assigned User": "assigned_user"
                }',
                'lang' => [
                'ar' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;direction:rtl;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    تم إنشاء الفرصة بنجاح
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    مرحبًا،
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    تم إنشاء فرصة جديدة في 
                    <strong style="color:#111827;">{company_name}</strong>
                    وتم تعيينها إلى 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    تفاصيل الفرصة
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    المرحلة: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 قيمة الفرصة</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 القيمة المتوقعة</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">🎯 نسبة النجاح</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_probability}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📅 تاريخ الإغلاق</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_close_date}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    مع أطيب التحيات،<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'da' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Mulighed Oprettet
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Hej,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    En ny salgsmulighed er blevet oprettet i 
                    <strong style="color:#111827;">{company_name}</strong>
                    og tildelt til 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Mulighedsdetaljer
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Fase: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 Mulighedsbeløb</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 Forventet Beløb</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Med venlig hilsen,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'de' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Opportunity Erfolgreich Erstellt
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Hallo,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Eine neue Opportunity wurde in 
                    <strong style="color:#111827;">{company_name}</strong>
                    erstellt und 
                    <strong style="color:#111827;">{assigned_user}</strong>
                    zugewiesen.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Opportunity-Details
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Phase: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 Opportunity-Betrag</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 Erwarteter Betrag</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Mit freundlichen Grüßen,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'en' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Opportunity Created Successfully
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Hello,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    A new opportunity has been created in 
                    <strong style="color:#111827;">{company_name}</strong> and assigned to 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Opportunity Details
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Stage: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    💰 OPPORTUNITY AMOUNT
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">
                    {opportunity_amount}
                    </div>
                    </td>

                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    📈 EXPECTED AMOUNT
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">
                    {opportunity_expected_amount}
                    </div>
                    </td>
                    </tr>

                    <tr>
                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    🎯 PROBABILITY
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">
                    {opportunity_probability}
                    </div>
                    </td>

                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    📅 CLOSE DATE
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">
                    {opportunity_close_date}
                    </div>
                    </td>
                    </tr>

                    <tr>
                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    🔔 NEXT FOLLOWUP
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">
                    {opportunity_next_followup_date}
                    </div>
                    </td>

                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    📢 LEAD SOURCE
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">
                    {opportunity_lead_source}
                    </div>
                    </td>
                    </tr>

                    <tr>
                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    🏢 ACCOUNT
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;">
                    {opportunity_account}
                    </div>
                    </td>

                    <td width="50%" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    👤 CONTACT
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;">
                    {opportunity_contact}
                    </div>
                    </td>
                    </tr>

                    <tr>
                    <td colspan="2" style="padding:14px 0;vertical-align:top;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">
                    ➡️ NEXT STEP
                    </div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;">
                    {opportunity_next_step}
                    </div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <div style="margin-top:30px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:20px;padding:28px;">

                    <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:18px;">
                    📝 Opportunity Description
                    </div>

                    <div style="font-size:15px;color:#4b5563;line-height:1.9;">
                    {opportunity_description}
                    </div>

                    </div>

                    <div style="margin-top:40px;text-align:center;">

                    <a href="{app_url}" 
                    style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:14px;font-size:15px;font-weight:700;box-shadow:0 8px 20px rgba(59,130,246,0.35);">

                    Open {app_name}

                    </a>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#6b7280;line-height:1.9;">
                    This opportunity is now available in your CRM dashboard for tracking, follow-ups, and sales progression updates.
                    </p>

                    <p style="margin-top:30px;font-size:15px;color:#374151;">
                    Best regards,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'es' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Oportunidad Creada Exitosamente
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Hola,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Se ha creado una nueva oportunidad en 
                    <strong style="color:#111827;">{company_name}</strong>
                    y asignado a 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Detalles de la Oportunidad
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Etapa: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 MONTO DE LA OPORTUNIDAD</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 MONTO ESPERADO</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Saludos cordiales,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'fr' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Opportunité Créée avec Succès
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Bonjour,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Une nouvelle opportunité a été créée dans 
                    <strong style="color:#111827;">{company_name}</strong>
                    et attribuée à 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Détails de l’Opportunité
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Étape : {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 MONTANT DE L’OPPORTUNITÉ</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 MONTANT PRÉVU</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Cordialement,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'it' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Opportunità Creata con Successo
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Ciao,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    È stata creata una nuova opportunità in 
                    <strong style="color:#111827;">{company_name}</strong>
                    ed assegnata a 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Dettagli Opportunità
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Fase: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 IMPORTO OPPORTUNITÀ</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 IMPORTO PREVISTO</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Cordiali saluti,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'ja' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    商談が正常に作成されました
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    こんにちは、
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    <strong style="color:#111827;">{company_name}</strong>
                    に新しい商談が作成され、
                    <strong style="color:#111827;">{assigned_user}</strong>
                    に割り当てられました。
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    商談詳細
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    ステージ: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 商談金額</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 予想金額</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    よろしくお願いいたします。<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'nl' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Opportunity Succesvol Aangemaakt
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Hallo,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Er is een nieuwe opportunity aangemaakt in 
                    <strong style="color:#111827;">{company_name}</strong>
                    en toegewezen aan 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Opportunity Details
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Fase: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 OPPORTUNITY BEDRAG</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 VERWACHT BEDRAG</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Met vriendelijke groet,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'pl' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Szansa Sprzedaży Utworzona Pomyślnie
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Witaj,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Nowa szansa sprzedaży została utworzona w 
                    <strong style="color:#111827;">{company_name}</strong>
                    i przypisana do 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Szczegóły Szansy
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Etap: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 KWOTA SZANSY</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 OCZEKIWANA KWOTA</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Z poważaniem,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'ru' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Сделка Успешно Создана
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Здравствуйте,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Новая сделка была создана в 
                    <strong style="color:#111827;">{company_name}</strong>
                    и назначена пользователю 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Детали Сделки
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Этап: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 СУММА СДЕЛКИ</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 ОЖИДАЕМАЯ СУММА</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    С уважением,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'pt' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Oportunidade Criada com Sucesso
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Olá,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Uma nova oportunidade foi criada em 
                    <strong style="color:#111827;">{company_name}</strong>
                    e atribuída a 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Detalhes da Oportunidade
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Etapa: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 VALOR DA OPORTUNIDADE</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 VALOR ESPERADO</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Atenciosamente,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Oportunidade Criada com Sucesso
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Olá,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    Uma nova oportunidade foi criada em 
                    <strong style="color:#111827;">{company_name}</strong>
                    e atribuída a 
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Detalhes da Oportunidade
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Etapa: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 VALOR DA OPORTUNIDADE</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 VALOR ESPERADO</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Atenciosamente,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'tr' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    Fırsat Başarıyla Oluşturuldu
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    Merhaba,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    <strong style="color:#111827;">{company_name}</strong>
                    içerisinde yeni bir fırsat oluşturuldu ve 
                    <strong style="color:#111827;">{assigned_user}</strong>
                    kullanıcısına atandı.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    Fırsat Detayları
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    Aşama: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 FIRSAT TUTARI</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 BEKLENEN TUTAR</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    Saygılarımızla,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'zh' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    商机创建成功
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    您好，
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    新的商机已在 
                    <strong style="color:#111827;">{company_name}</strong>
                    中创建，并分配给 
                    <strong style="color:#111827;">{assigned_user}</strong>。
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    商机详情
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    阶段: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 商机金额</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 预计金额</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    此致，<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',

                'he' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;direction:rtl;">

                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                    <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                    ההזדמנות נוצרה בהצלחה
                    </div>
                    </div>

                    <div style="padding:40px 35px;color:#374151;">

                    <p style="margin-top:0;font-size:16px;">
                    שלום,
                    </p>

                    <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                    נוצרה הזדמנות חדשה ב־
                    <strong style="color:#111827;">{company_name}</strong>
                    והוקצתה ל־
                    <strong style="color:#111827;">{assigned_user}</strong>.
                    </p>

                    <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                    <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                    <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    פרטי ההזדמנות
                    </div>

                    <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                    {opportunity_name}
                    </div>

                    <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                    שלב: {opportunity_stage}
                    </div>
                    </div>

                    <div style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                    <tr>
                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 סכום ההזדמנות</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_amount}</div>
                    </td>

                    <td width="50%" style="padding:14px 0;">
                    <div style="font-size:13px;color:#6b7280;font-weight:700;">📈 סכום צפוי</div>
                    <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{opportunity_expected_amount}</div>
                    </td>
                    </tr>

                    </table>
                    </div>
                    </div>

                    <p style="margin-top:40px;font-size:15px;color:#374151;">
                    בברכה,<br>
                    <strong>{company_name}</strong>
                    </p>

                    </div>
                    </div>
                    </div>',
                ],
            ],

            'Opportunity Move' => [
                'subject' => 'Opportunity Stage Changed',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Opportunity Name": "opportunity_name",
                    "Opportunity Amount": "opportunity_amount",
                    "Opportunity Account": "opportunity_account",
                    "Opportunity Contact": "opportunity_contact",
                    "Opportunity Stage": "opportunity_stage",
                    "Opportunity New Stage": "opportunity_new_stage"
                }',
                'lang' => [
                'ar' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                تم تحديث الفرصة
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                تم تحديث حالة الفرصة بنجاح.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    الفرصة
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        قيمة الفرصة
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        الحالة الحالية
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            الحساب
                                        </td>

                                        <td align="left" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            جهة الاتصال
                                        </td>

                                        <td align="left" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    عرض الفرصة
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'da' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Mulighed Opdateret
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Mulighedens status er blevet opdateret.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Mulighed
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Mulighedsbeløb
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Nuværende Status
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Konto
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Kontakt
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Se Mulighed
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'de' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Verkaufschance Aktualisiert
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Der Status der Verkaufschance wurde erfolgreich aktualisiert.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Verkaufschance
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Betrag der Verkaufschance
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Aktueller Status
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Konto
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Kontakt
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Verkaufschance Anzeigen
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'en' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Opportunity Updated
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                The opportunity status has been updated successfully.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Opportunity
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Opportunity Amount
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Current Status
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Account
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contact
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    View Opportunity
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'es' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Oportunidad Actualizada
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                El estado de la oportunidad se ha actualizado correctamente.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Oportunidad
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Importe de la Oportunidad
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Estado Actual
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Cuenta
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contacto
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Ver Oportunidad
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'fr' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Opportunité Mise à Jour
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Le statut de l\'opportunité a été mis à jour avec succès.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Opportunité
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Montant de l\'Opportunité
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Statut Actuel
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Compte
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contact
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Voir l\'Opportunité
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'it' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Opportunità Aggiornata
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Lo stato dell\'opportunità è stato aggiornato con successo.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Opportunità
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Importo Opportunità
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Stato Attuale
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Account
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contatto
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Visualizza Opportunità
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'ja' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                商談が更新されました
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                商談ステータスが正常に更新されました。
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    商談
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        商談金額
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        現在のステータス
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            アカウント
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            連絡先
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    商談を表示
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'nl' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Kans Bijgewerkt
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                De status van de kans is succesvol bijgewerkt.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Kans
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Kansbedrag
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Huidige Status
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Account
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contact
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Kans Bekijken
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'pl' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Szansa Sprzedaży Zaktualizowana
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Status szansy sprzedaży został pomyślnie zaktualizowany.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Szansa Sprzedaży
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Wartość Szansy
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Aktualny Status
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Konto
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Kontakt
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Zobacz Szansę
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'ru' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Возможность обновлена
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Статус возможности успешно обновлён.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Возможность
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Сумма возможности
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Текущий статус
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Аккаунт
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Контакт
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Просмотреть возможность
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'pt' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Oportunidade Atualizada
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                O status da oportunidade foi atualizado com sucesso.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Oportunidade
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Valor da Oportunidade
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Status Atual
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Conta
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contato
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Ver Oportunidade
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Oportunidade Atualizada
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                O status da oportunidade foi atualizado com sucesso.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Oportunidade
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Valor da Oportunidade
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Status Atual
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Conta
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Contato
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Ver Oportunidade
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'tr' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                Fırsat Güncellendi
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                Fırsat durumu başarıyla güncellendi.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    Fırsat
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        Fırsat Tutarı
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        Güncel Durum
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            Hesap
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            İletişim
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    Fırsatı Görüntüle
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'zh' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                商机已更新
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                商机状态已成功更新。
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    商机
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        商机金额
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        当前状态
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            客户
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            联系人
                                        </td>

                                        <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    查看商机
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'he' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;">

                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

                        <div style="padding:45px 35px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:30px;font-weight:700;color:#ffffff;">
                                הזדמנות עודכנה
                            </h1>

                            <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.90);">
                                סטטוס ההזדמנות עודכן בהצלחה.
                            </p>
                        </div>

                        <div style="padding:35px;">

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:25px;">

                                <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                    הזדמנות
                                </p>

                                <h2 style="margin:10px 0 20px;font-size:18px;color:#0f172a;">
                                    {opportunity_name}
                                </h2>

                                <div style="margin-bottom:22px;">
                                    <p style="margin:0 0 6px;font-size:14px;color:#64748b;font-weight:600;">
                                        סכום ההזדמנות
                                    </p>

                                    <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
                                        {opportunity_amount}
                                    </p>
                                </div>

                                <div style="margin-bottom:25px;">

                                    <p style="margin:0 0 10px;font-size:14px;color:#64748b;font-weight:600;">
                                        סטטוס נוכחי
                                    </p>

                                    <span style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border-radius:10px;
                                        font-size:14px;
                                        font-weight:700;
                                        color:#ffffff;
                                        background:#4f46e5;
                                    ">
                                        {opportunity_new_stage}
                                    </span>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            חשבון
                                        </td>

                                        <td align="left" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">
                                            איש קשר
                                        </td>

                                        <td align="left" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;">
                                            {opportunity_contact}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:35px;">
                                <a href="{app_url}" style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    border-radius:12px;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:700;
                                    color:#ffffff;
                                    background:#4f46e5;">
                                    צפה בהזדמנות
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                ],
            ],

            'Create Quote' => [
                'subject' => 'New Quote Created',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Quote Number": "quote_number",
                    "Quote Name": "quote_name",
                    "Quote Amount": "quote_amount",
                    "Quote Date": "quote_date",
                    "Quote Expiry Date": "quote_expiry_date",
                    "Quote Status": "quote_status",
                    "Quote Account": "quote_account",
                    "Quote Opportunity": "quote_opportunity",
                    "Assigned User": "assigned_user",
                    "Created By": "created_by"
                }',
                'lang' => [
                    'ar' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;direction:rtl;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        تم إنشاء عرض السعر بنجاح
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        مرحباً،
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        تم إنشاء عرض سعر جديد في 
                        <strong style="color:#111827;">{company_name}</strong>
                        بواسطة <strong style="color:#111827;">{created_by}</strong>
                        وتم تعيينه إلى 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        تفاصيل عرض السعر
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        رقم العرض: {quote_number}
                        </div>
                        </div>

                        <div style="padding:30px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 قيمة العرض</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_amount}</div>
                        </td>

                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">📅 تاريخ العرض</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_date}</div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        فتح {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        مع أطيب التحيات،<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'da' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Tilbud Oprettet Successfully
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hej,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Et nyt tilbud er blevet oprettet i 
                        <strong style="color:#111827;">{company_name}</strong>
                        af <strong style="color:#111827;">{created_by}</strong>
                        og tildelt til 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Åbn {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Med venlig hilsen,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'de' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Angebot Erfolgreich Erstellt
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hallo,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Ein neues Angebot wurde in 
                        <strong style="color:#111827;">{company_name}</strong>
                        von <strong style="color:#111827;">{created_by}</strong>
                        erstellt und zugewiesen an 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        {app_name} Öffnen
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Mit freundlichen Grüßen,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'en' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Quote Created Successfully
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hello,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        A new quote has been created in 
                        <strong style="color:#111827;">{company_name}</strong>
                        by <strong style="color:#111827;">{created_by}</strong>
                        and assigned to 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Quote Details
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Quote #: {quote_number}
                        </div>
                        </div>

                        <div style="padding:30px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">

                        <tr>
                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">💰 Quote Amount</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_amount}</div>
                        </td>

                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">📅 Quote Date</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_date}</div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">⏰ Expiry Date</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_expiry_date}</div>
                        </td>

                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">📊 Status</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_status}</div>
                        </td>
                        </tr>

                        <tr>
                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">🏢 Account</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_account}</div>
                        </td>

                        <td width="50%" style="padding:14px 0;">
                        <div style="font-size:13px;color:#6b7280;font-weight:700;">🎯 Opportunity</div>
                        <div style="margin-top:6px;font-size:16px;color:#111827;font-weight:600;">{quote_opportunity}</div>
                        </td>
                        </tr>

                        </table>
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Open {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Best regards,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'es' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Cotización Creada Exitosamente
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hola,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Se ha creado una nueva cotización en 
                        <strong style="color:#111827;">{company_name}</strong>
                        por <strong style="color:#111827;">{created_by}</strong>
                        y asignada a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Detalles de la Cotización
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Cotización #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Abrir {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Saludos cordiales,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'fr' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Devis Créé avec Succès
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Bonjour,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Un nouveau devis a été créé dans 
                        <strong style="color:#111827;">{company_name}</strong>
                        par <strong style="color:#111827;">{created_by}</strong>
                        et attribué à 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Détails du Devis
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Devis #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Ouvrir {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Cordialement,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'it' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Preventivo Creato con Successo
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Ciao,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Un nuovo preventivo è stato creato in 
                        <strong style="color:#111827;">{company_name}</strong>
                        da <strong style="color:#111827;">{created_by}</strong>
                        ed assegnato a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Dettagli del Preventivo
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Preventivo #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Apri {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Cordiali saluti,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'ja' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        見積書が正常に作成されました
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        こんにちは、
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        新しい見積書が 
                        <strong style="color:#111827;">{company_name}</strong>
                        で <strong style="color:#111827;">{created_by}</strong>
                        により作成され、
                        <strong style="color:#111827;">{assigned_user}</strong>
                        に割り当てられました。
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        見積詳細
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        見積番号: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        {app_name} を開く
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        よろしくお願いいたします。<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'nl' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Offerte Succesvol Aangemaakt
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Hallo,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Een nieuwe offerte is aangemaakt in 
                        <strong style="color:#111827;">{company_name}</strong>
                        door <strong style="color:#111827;">{created_by}</strong>
                        en toegewezen aan 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Offertegegevens
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Offerte #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Open {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Met vriendelijke groet,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'pl' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Oferta Utworzona Pomyślnie
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Witaj,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Nowa oferta została utworzona w 
                        <strong style="color:#111827;">{company_name}</strong>
                        przez <strong style="color:#111827;">{created_by}</strong>
                        i przypisana do 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Szczegóły Oferty
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Oferta #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Otwórz {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Z poważaniem,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'ru' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Коммерческое Предложение Успешно Создано
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Здравствуйте,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Новое коммерческое предложение было создано в 
                        <strong style="color:#111827;">{company_name}</strong>
                        пользователем <strong style="color:#111827;">{created_by}</strong>
                        и назначено 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Детали Предложения
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Предложение #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Открыть {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        С уважением,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'pt' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Cotação Criada com Sucesso
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Olá,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Uma nova cotação foi criada em 
                        <strong style="color:#111827;">{company_name}</strong>
                        por <strong style="color:#111827;">{created_by}</strong>
                        e atribuída a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Detalhes da Cotação
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Cotação #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Abrir {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Atenciosamente,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Cotação Criada com Sucesso
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Olá,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Uma nova cotação foi criada em 
                        <strong style="color:#111827;">{company_name}</strong>
                        por <strong style="color:#111827;">{created_by}</strong>
                        e atribuída a 
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Detalhes da Cotação
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Cotação #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        Abrir {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Atenciosamente,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'tr' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        Teklif Başarıyla Oluşturuldu
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        Merhaba,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        Yeni bir teklif 
                        <strong style="color:#111827;">{company_name}</strong>
                        içerisinde <strong style="color:#111827;">{created_by}</strong>
                        tarafından oluşturuldu ve 
                        <strong style="color:#111827;">{assigned_user}</strong>
                        kullanıcısına atandı.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        Teklif Detayları
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        Teklif No: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        {app_name} Aç
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        Saygılarımızla,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'zh' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        报价已成功创建
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        您好，
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        新报价已在 
                        <strong style="color:#111827;">{company_name}</strong>
                        中由 <strong style="color:#111827;">{created_by}</strong>
                        创建，并分配给 
                        <strong style="color:#111827;">{assigned_user}</strong>。
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        报价详情
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        报价编号: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        打开 {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        此致，<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',

                    'he' => '<div style="margin:0;padding:40px 20px;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;direction:rtl;">

                        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(79,70,229,0.12);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:45px 35px;text-align:center;">

                        <div style="margin-top:20px;font-size:32px;font-weight:700;color:#ffffff;">
                        הצעת המחיר נוצרה בהצלחה
                        </div>
                        </div>

                        <div style="padding:40px 35px;color:#374151;">

                        <p style="margin-top:0;font-size:16px;">
                        שלום,
                        </p>

                        <p style="font-size:15px;line-height:1.9;color:#4b5563;">
                        הצעת מחיר חדשה נוצרה ב־
                        <strong style="color:#111827;">{company_name}</strong>
                        על ידי <strong style="color:#111827;">{created_by}</strong>
                        והוקצתה ל־
                        <strong style="color:#111827;">{assigned_user}</strong>.
                        </p>

                        <div style="margin-top:35px;background:linear-gradient(180deg,#f8fafc,#ffffff);border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;">

                        <div style="padding:24px 28px;border-bottom:1px solid #eef2f7;background:#f8fafc;">

                        <div style="font-size:14px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                        פרטי הצעת המחיר
                        </div>

                        <div style="margin-top:12px;font-size:30px;font-weight:700;color:#111827;">
                        {quote_name}
                        </div>

                        <div style="margin-top:10px;display:inline-block;background:#dbeafe;color:#1d4ed8;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;">
                        הצעה #: {quote_number}
                        </div>
                        </div>

                        <div style="margin:35px 0;text-align:center;">
                        <a href="{app_url}" 
                        style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;display:inline-block;font-size:15px;">
                        פתח את {app_name}
                        </a>
                        </div>

                        <p style="margin-top:40px;font-size:15px;color:#374151;">
                        בברכה,<br>
                        <strong>{company_name}</strong>
                        </p>

                        </div>
                        </div>
                    </div>',
                ]
            ],

            'Quote Status Update' => [
                'subject' => 'Quote Status Changed',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Quote Number": "quote_number",
                    "Quote Name": "quote_name",
                    "Quote Amount": "quote_amount",
                    "Quote Date": "quote_date",
                    "Quote Expiry Date": "quote_expiry_date",
                    "Quote Status": "quote_status",
                    "Quote Old Status": "quote_old_status",
                    "Quote Account": "quote_account",
                    "Quote Opportunity": "quote_opportunity", 
                    "Created By": "created_by"
                }',
                'lang' => [
                'ar' => '<div dir="rtl" style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                تم تحديث حالة عرض السعر
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                تم تحديث حالة عرض السعر بنجاح.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            رقم عرض السعر
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:left;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            قيمة عرض السعر
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        اسم عرض السعر
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        تقدم الحالة
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            ←
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            تاريخ عرض السعر
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            تاريخ الانتهاء
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            الحساب
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            الفرصة
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            تم الإنشاء بواسطة
                                        </td>
                                        <td align="left" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    عرض عرض السعر
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                'da' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Tilbudsstatus Opdateret
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Statussen for et tilbud er blevet opdateret.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Tilbudsnummer
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Tilbudsbeløb
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Tilbudsnavn
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Statusforløb
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Tilbudsdato
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Udløbsdato
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Konto
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Mulighed
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Oprettet Af
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Se Tilbud
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'de' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Angebotsstatus Aktualisiert
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Der Status eines Angebots wurde erfolgreich aktualisiert.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Angebotsnummer
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Angebotsbetrag
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Angebotsname
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Statusverlauf
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Angebotsdatum
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Ablaufdatum
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Konto
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Verkaufschance
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Erstellt Von
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Angebot Anzeigen
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'en' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Quote Status Updated
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                The status of a quote has been updated successfully.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Quote Number
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Quote Amount
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Quote Name
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Status Progress
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Quote Date
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Expiry Date
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Account
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Opportunity
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Created By
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    View Quote
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'es' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Estado del Presupuesto Actualizado
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                El estado de un presupuesto ha sido actualizado correctamente.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Número de Presupuesto
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Importe del Presupuesto
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Nombre del Presupuesto
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Progreso del Estado
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Fecha del Presupuesto
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Fecha de Expiración
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Cuenta
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Oportunidad
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Creado Por
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Ver Presupuesto
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'fr' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Statut du Devis Mis à Jour
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Le statut d’un devis a été mis à jour avec succès.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Numéro du Devis
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Montant du Devis
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Nom du Devis
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Progression du Statut
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Date du Devis
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Date d’Expiration
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Compte
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Opportunité
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Créé Par
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Voir le Devis
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'it' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Stato del Preventivo Aggiornato
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Lo stato di un preventivo è stato aggiornato con successo.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Numero Preventivo
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Importo Preventivo
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Nome Preventivo
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Avanzamento Stato
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data Preventivo
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data di Scadenza
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Account
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Opportunità
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Creato Da
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Visualizza Preventivo
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'ja' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                見積ステータスが更新されました
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                見積のステータスが正常に更新されました。
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            見積番号
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            見積金額
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        見積名
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        ステータス進行状況
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            見積日
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            有効期限
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            アカウント
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            商談
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            作成者
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    見積を表示
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'nl' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Offertestatus Bijgewerkt
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                De status van een offerte is succesvol bijgewerkt.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Offertenummer
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Offertebedrag
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Offertenaam
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Statusvoortgang
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Offertedatum
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Vervaldatum
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Account
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Kans
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Aangemaakt Door
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Offerte Bekijken
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'pl' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Status Oferty Został Zaktualizowany
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Status oferty został pomyślnie zaktualizowany.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Numer Oferty
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Kwota Oferty
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Nazwa Oferty
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Postęp Statusu
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data Oferty
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data Wygaśnięcia
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Konto
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Szansa
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Utworzone Przez
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Zobacz Ofertę
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'ru' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Статус Коммерческого Предложения Обновлён
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Статус коммерческого предложения был успешно обновлён.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Номер Предложения
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Сумма Предложения
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Название Предложения
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Изменение Статуса
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Дата Предложения
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Дата Истечения
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Аккаунт
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Возможность
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Создано
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Просмотреть Предложение
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'pt' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Status da Cotação Atualizado
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                O status de uma cotação foi atualizado com sucesso.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Número da Cotação
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Valor da Cotação
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Nome da Cotação
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Progresso do Status
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data da Cotação
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data de Expiração
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Conta
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Oportunidade
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Criado Por
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Ver Cotação
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'pt-BR' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Status da Cotação Atualizado
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                O status de uma cotação foi atualizado com sucesso.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Número da Cotação
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Valor da Cotação
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Nome da Cotação
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Progresso do Status
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data da Cotação
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Data de Expiração
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Conta
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Oportunidade
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Criado Por
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Ver Cotação
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'tr' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                Teklif Durumu Güncellendi
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                Bir teklifin durumu başarıyla güncellendi.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            Teklif Numarası
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            Teklif Tutarı
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        Teklif Adı
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        Durum İlerlemesi
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Teklif Tarihi
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Son Geçerlilik Tarihi
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Hesap
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            Fırsat
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            Oluşturan
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    Teklifi Görüntüle
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'zh' => '<div style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                报价状态已更新
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                报价的状态已成功更新。
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            报价编号
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:right;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            报价金额
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        报价名称
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        状态进度
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            →
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            报价日期
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            到期日期
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            客户账户
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            商机
                                        </td>
                                        <td align="right" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            创建者
                                        </td>
                                        <td align="right" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    查看报价
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'he' => '<div dir="rtl" style="margin:0;padding:40px 20px;background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(59,130,246,0.12);border:1px solid #dbeafe;">
                        <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
                            <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;">
                                סטטוס הצעת המחיר עודכן
                            </h1>

                            <p style="margin:14px 0 0;color:rgba(255,255,255,0.88);font-size:17px;line-height:1.7;">
                                סטטוס הצעת המחיר עודכן בהצלחה.
                            </p>
                        </div>

                        <div style="padding:45px 40px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:22px;padding:30px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;margin-bottom:24px;">
                                    <div>
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                                            מספר הצעת מחיר
                                        </p>
                                        <h2 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#0f172a;">
                                            #{quote_number}
                                        </h2>
                                    </div>

                                    <div style="text-align:left;">
                                        <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">
                                            סכום הצעת המחיר
                                        </p>
                                        <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:#15803d;">
                                            {quote_amount}
                                        </p>
                                    </div>
                                </div>

                                <div style="margin-bottom:26px;">
                                    <p style="margin:0;font-size:15px;color:#64748b;font-weight:600;">
                                        שם הצעת המחיר
                                    </p>
                                    <p style="margin:8px 0 0;font-size:20px;color:#0f172a;font-weight:700;">
                                        {quote_name}
                                    </p>
                                </div>

                                <div style="background:#ffffff;border-radius:18px;padding:22px;border:1px solid #e2e8f0;margin-bottom:28px;">
                                    
                                    <p style="margin:0 0 18px;font-size:15px;font-weight:700;color:#334155;text-align:center;">
                                        התקדמות הסטטוס
                                    </p>

                                    <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #fed7aa;color:#c2410c;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_old_status}
                                        </div>
                                        <div style="font-size:28px;color:#6366f1;font-weight:700;">
                                            ←
                                        </div>
                                        <div style="padding:12px 22px;border-radius:12px;border:1px solid #bbf7d0;color:#166534;font-size:15px;font-weight:700;background:#fff;">
                                            {quote_status}
                                        </div>
                                    </div>
                                </div>

                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            תאריך הצעת המחיר
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            תאריך תפוגה
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_expiry_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            חשבון
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_account}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:15px;font-weight:600;">
                                            הזדמנות
                                        </td>
                                        <td align="left" style="padding:14px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {quote_opportunity}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:14px 0;color:#64748b;font-size:15px;font-weight:600;">
                                            נוצר על ידי
                                        </td>
                                        <td align="left" style="padding:14px 0;color:#0f172a;font-size:15px;font-weight:700;">
                                            {created_by}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align:center;margin-top:40px;">
                                <a href="{app_url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 34px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,0.25);">
                                    הצג הצעת מחיר
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                ],
            ],

            'Create Sales Order' => [
                'subject' => 'New Order Created',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Order Number": "order_number",
                    "Order Name": "order_name",
                    "Order Amount": "order_amount",
                    "Order Date": "order_date",
                    "Order Status": "order_status",
                    "Order Account": "order_account",
                    "Order Opportunity": "order_opportunity",
                    "Order Quote": "order_quote"
                }',
                'lang' => [
                'ar' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 تم إنشاء أمر بيع جديد</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">تم إنشاء طلب جديد بنجاح في النظام الخاص بك</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">ملخص الطلب</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">رقم الطلب</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">اسم الطلب</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">المبلغ</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">التاريخ</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">الحالة</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">تفاصيل مرتبطة</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>الحساب:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>الفرصة:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>عرض السعر:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

               'da' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Ny salgsordre oprettet</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">En ny ordre er blevet oprettet i dit system</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Ordreoversigt</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Ordrenummer</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Ordrenavn</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Beløb</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Dato</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Status</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Tilknyttede detaljer</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Konto:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Mulighed:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Tilbud:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'de' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Neuer Verkaufsauftrag erstellt</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Ein neuer Auftrag wurde erfolgreich im System erstellt</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Auftragsübersicht</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Auftragsnummer</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Auftragsname</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Betrag</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Datum</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Status</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Verknüpfte Details</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Konto:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Chance:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Angebot:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'en' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🧾 New Sales Order Created</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">A new order has been successfully generated in your system</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Order Summary</h3>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Order Number</td>
                            <td style="padding:10px 0;font-weight:600;">{order_number}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Order Name</td>
                            <td style="padding:10px 0;font-weight:600;">{order_name}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Amount</td>
                            <td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Date</td>
                            <td style="padding:10px 0;font-weight:600;">{order_date}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Status</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                {order_status}
                                </span>
                            </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
                        <h4 style="margin-bottom:10px;">Linked Details</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Account:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Opportunity:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Quote:</b> {order_quote}</p>

                        </div>
                    </div>
                </div>',

                'es' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Nuevo Pedido de Venta Creado</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Se ha generado un nuevo pedido en tu sistema</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Resumen del Pedido</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Número de Pedido</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Nombre del Pedido</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Importe</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Fecha</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Estado</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Detalles relacionados</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Cuenta:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Oportunidad:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Cotización:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'fr' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Nouvelle Commande de Vente Créée</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Une nouvelle commande a été générée dans votre système</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Résumé de la commande</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Numéro de commande</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Nom de la commande</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Montant</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Date</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Statut</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Détails liés</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Compte :</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Opportunité :</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Devis :</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'it' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Nuovo Ordine di Vendita Creato</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Un nuovo ordine è stato generato nel tuo sistema</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Riepilogo Ordine</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Numero Ordine</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Nome Ordine</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Importo</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Stato</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Dettagli collegati</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Account:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Opportunità:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Preventivo:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'ja' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 新しい販売注文が作成されました</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">システムに新しい注文が正常に作成されました</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">注文概要</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">注文番号</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">注文名</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">金額</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">日付</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">ステータス</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">関連情報</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>アカウント:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>商談:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>見積:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'nl' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Nieuwe Verkooporder Aangemaakt</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Er is een nieuwe order succesvol aangemaakt in uw systeem</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Orderoverzicht</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Ordernummer</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Ordernaam</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Bedrag</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Datum</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Status</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Gerelateerde details</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Account:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Kans:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Offerte:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'pl' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Utworzono nowe zamówienie sprzedaży</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Nowe zamówienie zostało pomyślnie utworzone w systemie</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Podsumowanie zamówienia</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Numer zamówienia</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Nazwa zamówienia</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Kwota</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Status</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Powiązane szczegóły</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Konto:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Szansa:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Oferta:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'ru' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Создан новый заказ</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Новый заказ успешно создан в вашей системе</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Информация о заказе</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Номер заказа</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Название заказа</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Сумма</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Дата</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Статус</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Связанные данные</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Аккаунт:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Сделка:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Котировка:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'pt' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Novo Pedido de Venda Criado</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Um novo pedido foi criado com sucesso no seu sistema</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Resumo do Pedido</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Número do Pedido</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Nome do Pedido</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Valor</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Status</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Detalhes Relacionados</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Conta:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Oportunidade:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Cotação:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Novo Pedido de Venda Criado</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Um novo pedido foi criado com sucesso no seu sistema</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Resumo do Pedido</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Número do Pedido</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Nome do Pedido</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Valor</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Status</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Detalhes Relacionados</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Conta:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Oportunidade:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Cotação:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'tr' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 Yeni Satış Siparişi Oluşturuldu</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Sistemde yeni bir sipariş başarıyla oluşturuldu</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">Sipariş Özeti</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">Sipariş Numarası</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Sipariş Adı</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Tutar</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Tarih</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">Durum</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">Bağlı Detaylar</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>Hesap:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Fırsat:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>Teklif:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'zh' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 新销售订单已创建</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">系统中已成功创建新订单</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">订单摘要</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">订单编号</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">订单名称</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">金额</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">日期</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">状态</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">关联信息</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>账户：</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>商机：</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>报价：</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',

                'he' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;text-align:right;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:28px;text-align:center;color:#fff;">
                            <h2 style="margin:0;font-size:22px;">🧾 נוצר הזמנת מכירה חדשה</h2>
                            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">הזמנה חדשה נוצרה בהצלחה במערכת שלך</p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                            <h3 style="margin-top:0;color:#1f2937;">סיכום הזמנה</h3>

                            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                <tr><td style="padding:10px 0;color:#6b7280;">מספר הזמנה</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">שם הזמנה</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">סכום</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">תאריך</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                                <tr><td style="padding:10px 0;color:#6b7280;">סטטוס</td><td style="padding:10px 0;font-weight:600;"><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">{order_status}</span></td></tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                            <h4 style="margin-bottom:10px;">פרטים קשורים</h4>
                            <p style="margin:6px 0;font-size:14px;"><b>חשבון:</b> {order_account}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>הזדמנות:</b> {order_opportunity}</p>
                            <p style="margin:6px 0;font-size:14px;"><b>הצעת מחיר:</b> {order_quote}</p>
                        </div>
                    </div>
                </div>',
                ],
            ],

            'Sales Order Status Update' => [
                'subject' => 'Order Status Changed',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Order Number": "order_number",
                    "Order Name": "order_name",
                    "Order Amount": "order_amount",
                    "Order Date": "order_date",
                    "Order Status": "order_status",
                    "Order Old Status": "order_old_status",
                    "Order Account": "order_account",
                    "Order Opportunity": "order_opportunity",
                    "Order Quote": "order_quote", 
                    "Assigned User": "assigned_user", 
                    "Created By": "created_by"
                }',
                'lang' => [
                'ar' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;text-align:right;">

                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 تم تحديث حالة أمر البيع</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            تم تغيير حالة الطلب في نظامك
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">ملخص حالة الطلب</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">رقم الطلب</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">اسم الطلب</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">المبلغ</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">التاريخ</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">الحالة السابقة</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">الحالة الجديدة</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">معلومات مرتبطة</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>الحساب:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>الفرصة:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>عرض السعر:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">معلومات النشاط</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>المستخدم المسؤول:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>أنشئ بواسطة:</b> {created_by}</p>
                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        مدعوم من {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">فتح التطبيق</a>
                        </div>

                    </div>
                    </div>',

                'da' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Salgsordre status opdateret</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            Ordrestatus er blevet ændret i dit system
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Statusoversigt</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Ordrenummer</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Ordrenavn</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Beløb</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Dato</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Gammel status</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Ny status</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Relateret information</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Konto:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Mulighed:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Tilbud:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Aktivitetsinformation</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Tildelt bruger:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Oprettet af:</b> {created_by}</p>
                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        Drevet af {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Åbn app</a>
                        </div>

                    </div>
                    </div>',

                'de' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Verkaufsauftragsstatus aktualisiert</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            Der Auftragsstatus wurde in Ihrem System geändert
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Statusübersicht</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Auftragsnummer</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Auftragsname</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Betrag</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Datum</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Alter Status</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Neuer Status</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Verknüpfte Informationen</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Konto:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Verkaufschance:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Angebot:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Aktivitätsinformationen</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Zugewiesener Benutzer:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Erstellt von:</b> {created_by}</p>
                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        Powered by {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">App öffnen</a>
                        </div>

                    </div>
                    </div>',

                                    'en' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Sales Order Status Updated</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            Order status has been changed in your system
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Order Status Summary</h3>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Order Number</td>
                            <td style="padding:10px 0;font-weight:600;">{order_number}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Order Name</td>
                            <td style="padding:10px 0;font-weight:600;">{order_name}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Amount</td>
                            <td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Date</td>
                            <td style="padding:10px 0;font-weight:600;">{order_date}</td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">Old Status</td>
                            <td style="padding:10px 0;font-weight:600;color:#ef4444;">
                                {order_old_status}
                            </td>
                            </tr>
                            <tr>
                            <td style="padding:10px 0;color:#6b7280;">New Status</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                {order_status}
                                </span>
                            </td>
                            </tr>
                        </table>
                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Linked Information</h4>

                        <p style="margin:6px 0;font-size:14px;"><b>Account:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Opportunity:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Quote:</b> {order_quote}</p>
                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
                        <h4 style="margin-bottom:10px;">Activity Info</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Assigned User:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Created By:</b> {created_by}</p>

                        </div>
                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        Powered by {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Open App</a>
                        </div>

                    </div>
                    </div>',

                'es' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Estado del pedido de venta actualizado</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            El estado del pedido ha sido cambiado en tu sistema
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Resumen del estado del pedido</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Número de pedido</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Nombre del pedido</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Importe</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Fecha</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Estado anterior</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Nuevo estado</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Información vinculada</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Cuenta:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Oportunidad:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Cotización:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Información de actividad</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Usuario asignado:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Creado por:</b> {created_by}</p>

                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        Impulsado por {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Abrir aplicación</a>
                        </div>

                    </div>
                </div>',

                'fr' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                            box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                    <h2 style="margin:0;font-size:22px;">🔄 Statut de commande mis à jour</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                        Le statut de la commande a été modifié dans votre système
                    </p>
                    </div>

                    <div style="padding:28px;color:#111827;">
                    <h3 style="margin-top:0;color:#1f2937;">Résumé du statut de la commande</h3>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:10px 0;color:#6b7280;">Numéro de commande</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nom de la commande</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Montant</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Date</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Ancien statut</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nouveau statut</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                    {order_status}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Informations liées</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Compte :</b> {order_account}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Opportunité :</b> {order_opportunity}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Devis :</b> {order_quote}</p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Informations d’activité</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Utilisateur assigné :</b> {assigned_user}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Créé par :</b> {created_by}</p>

                    </div>

                    <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                    Propulsé par {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Ouvrir l’application</a>
                    </div>

                </div>
                </div>',

                'it' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                            box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                    <h2 style="margin:0;font-size:22px;">🔄 Stato ordine di vendita aggiornato</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                        Lo stato dell’ordine è stato modificato nel tuo sistema
                    </p>
                    </div>

                    <div style="padding:28px;color:#111827;">
                    <h3 style="margin-top:0;color:#1f2937;">Riepilogo stato ordine</h3>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:10px 0;color:#6b7280;">Numero ordine</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nome ordine</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Importo</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Stato precedente</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nuovo stato</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                    {order_status}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Informazioni collegate</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Account:</b> {order_account}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Opportunità:</b> {order_opportunity}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Preventivo:</b> {order_quote}</p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Informazioni attività</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Utente assegnato:</b> {assigned_user}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Creato da:</b> {created_by}</p>

                    </div>

                    <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                    Alimentato da {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Apri app</a>
                    </div>

                </div>
                </div>',

                'ja' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 受注ステータスが更新されました</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            システム内で注文ステータスが変更されました
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">注文ステータス概要</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">注文番号</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">注文名</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">金額</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">日付</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">以前のステータス</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">新しいステータス</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">関連情報</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>アカウント:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>商談:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>見積:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">アクティビティ情報</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>担当ユーザー:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>作成者:</b> {created_by}</p>

                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">アプリを開く</a>
                        </div>

                    </div>
                </div>',

                'nl' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                            box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                    <h2 style="margin:0;font-size:22px;">🔄 Verkooporderstatus bijgewerkt</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                        De orderstatus is gewijzigd in je systeem
                    </p>
                    </div>

                    <div style="padding:28px;color:#111827;">
                    <h3 style="margin-top:0;color:#1f2937;">Statusoverzicht</h3>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:10px 0;color:#6b7280;">Ordernummer</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Ordernaam</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Bedrag</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Datum</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Oude status</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nieuwe status</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                    {order_status}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Gerelateerde informatie</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Account:</b> {order_account}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Kans:</b> {order_opportunity}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Offerte:</b> {order_quote}</p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Activiteit informatie</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Toegewezen gebruiker:</b> {assigned_user}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Aangemaakt door:</b> {created_by}</p>

                    </div>

                    <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                    {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">App openen</a>
                    </div>

                </div>
                </div>',

                'pl' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                            box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                    <h2 style="margin:0;font-size:22px;">🔄 Zaktualizowano status zamówienia</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                        Status zamówienia został zmieniony w Twoim systemie
                    </p>
                    </div>

                    <div style="padding:28px;color:#111827;">
                    <h3 style="margin-top:0;color:#1f2937;">Podsumowanie statusu</h3>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:10px 0;color:#6b7280;">Numer zamówienia</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nazwa zamówienia</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Kwota</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Poprzedni status</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">Nowy status</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                    {order_status}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Powiązane informacje</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Konto:</b> {order_account}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Szansa:</b> {order_opportunity}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Oferta:</b> {order_quote}</p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">Informacje o aktywności</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>Przypisany użytkownik:</b> {assigned_user}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>Utworzono przez:</b> {created_by}</p>

                    </div>

                    <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                    {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Otwórz aplikację</a>
                    </div>

                </div>
                </div>',

                'ru' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Обновлён статус заказа продажи</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            Статус заказа был изменён в вашей системе
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Сводка статуса заказа</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Номер заказа</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Название заказа</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Сумма</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Дата</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Предыдущий статус</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Новый статус</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Связанная информация</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Аккаунт:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Сделка:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Коммерческое предложение:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Информация об активности</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Назначенный пользователь:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Создано:</b> {created_by}</p>

                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Открыть приложение</a>
                        </div>

                    </div>
                </div>',

                'pt' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Status do pedido de venda atualizado</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            O status do pedido foi alterado no seu sistema
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Resumo do status do pedido</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Número do pedido</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Nome do pedido</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Valor</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Status anterior</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Novo status</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Informações relacionadas</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Conta:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Oportunidade:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Cotação:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Informações de atividade</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Usuário atribuído:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Criado por:</b> {created_by}</p>

                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Abrir aplicativo</a>
                        </div>

                    </div>
                </div>',

                'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Status do pedido de venda atualizado</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            O status do pedido foi alterado no seu sistema
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Resumo do status do pedido</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Número do pedido</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Nome do pedido</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Valor</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Data</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Status anterior</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Novo status</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Informações relacionadas</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Conta:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Oportunidade:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Cotação:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Informações de atividade</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Usuário atribuído:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Criado por:</b> {created_by}</p>

                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Abrir aplicativo</a>
                        </div>

                    </div>
                </div>',

                'tr' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                                box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                        <h2 style="margin:0;font-size:22px;">🔄 Satış siparişi durumu güncellendi</h2>
                        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                            Sipariş durumu sisteminizde değiştirildi
                        </p>
                        </div>

                        <div style="padding:28px;color:#111827;">
                        <h3 style="margin-top:0;color:#1f2937;">Sipariş Durum Özeti</h3>

                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="padding:10px 0;color:#6b7280;">Sipariş Numarası</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Sipariş Adı</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Tutar</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Tarih</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Eski Durum</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                            <tr><td style="padding:10px 0;color:#6b7280;">Yeni Durum</td>
                                <td style="padding:10px 0;font-weight:600;">
                                    <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                        {order_status}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Bağlantılı Bilgiler</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Hesap:</b> {order_account}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Fırsat:</b> {order_opportunity}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Teklif:</b> {order_quote}</p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                        <h4 style="margin-bottom:10px;">Aktivite Bilgisi</h4>
                        <p style="margin:6px 0;font-size:14px;"><b>Atanan Kullanıcı:</b> {assigned_user}</p>
                        <p style="margin:6px 0;font-size:14px;"><b>Oluşturan:</b> {created_by}</p>
                        </div>

                        <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                        {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">Uygulamayı Aç</a>
                        </div>

                    </div>
                </div>',

                'zh' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;">

                <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                            box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                    <h2 style="margin:0;font-size:22px;">🔄 销售订单状态已更新</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                        订单状态已在系统中更改
                    </p>
                    </div>

                    <div style="padding:28px;color:#111827;">
                    <h3 style="margin-top:0;color:#1f2937;">订单状态摘要</h3>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:10px 0;color:#6b7280;">订单编号</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">订单名称</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">金额</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">日期</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">旧状态</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">新状态</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                    {order_status}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">关联信息</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>账户：</b> {order_account}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>商机：</b> {order_opportunity}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>报价：</b> {order_quote}</p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">活动信息</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>分配用户：</b> {assigned_user}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>创建人：</b> {created_by}</p>
                    </div>

                    <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                    {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">打开应用</a>
                    </div>

                </div>
                </div>',

                'he' => '<div style="margin:0;padding:40px 20px;background:#f4f7ff;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;text-align:right;">

                <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;
                            box-shadow:0 15px 40px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">

                    <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px;text-align:center;color:#fff;">
                    <h2 style="margin:0;font-size:22px;">🔄 סטטוס הזמנת מכירה עודכן</h2>
                    <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                        סטטוס ההזמנה שונה במערכת שלך
                    </p>
                    </div>

                    <div style="padding:28px;color:#111827;">
                    <h3 style="margin-top:0;color:#1f2937;">סיכום סטטוס הזמנה</h3>

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:10px 0;color:#6b7280;">מספר הזמנה</td><td style="padding:10px 0;font-weight:600;">{order_number}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">שם הזמנה</td><td style="padding:10px 0;font-weight:600;">{order_name}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">סכום</td><td style="padding:10px 0;font-weight:600;color:#16a34a;">{order_amount}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">תאריך</td><td style="padding:10px 0;font-weight:600;">{order_date}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">סטטוס קודם</td><td style="padding:10px 0;font-weight:600;color:#ef4444;">{order_old_status}</td></tr>
                        <tr><td style="padding:10px 0;color:#6b7280;">סטטוס חדש</td>
                            <td style="padding:10px 0;font-weight:600;">
                                <span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;">
                                    {order_status}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">מידע מקושר</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>חשבון:</b> {order_account}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>הזדמנות:</b> {order_opportunity}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>הצעת מחיר:</b> {order_quote}</p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                    <h4 style="margin-bottom:10px;">מידע פעילות</h4>
                    <p style="margin:6px 0;font-size:14px;"><b>משתמש משויך:</b> {assigned_user}</p>
                    <p style="margin:6px 0;font-size:14px;"><b>נוצר על ידי:</b> {created_by}</p>
                    </div>

                    <div style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
                    {app_name} • <a href="{app_url}" style="color:#4f46e5;text-decoration:none;">פתח אפליקציה</a>
                    </div>

                </div>
                </div>',
                ],
            ],

            'Create Contact' => [
                'subject' => 'New Contact Created',
                'variables' => '{
                    "App Url": "app_url",
                    "App Name": "app_name",
                    "Company Name": "company_name",
                    "Contact Name": "contact_name",
                    "Contact Email": "contact_email",
                    "Contact Phone": "contact_phone",
                    "Contact Job Title": "job_title",
                    "Contact Department": "contact_department",
                    "Contact Account": "contact_account",
                    "Contact Address": "contact_address",
                    "Contact City": "contact_city",
                    "Contact State": "contact_state",
                    "Contact Country": "contact_country",
                    "Contact Postal Code": "contact_postal_code",
                    "Assigned User": "assigned_user",
                    "Created By": "created_by"
                }',
                'lang' => [
                'ar' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;text-align:right;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                تم إنشاء جهة اتصال جديدة
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                تمت إضافة جهة اتصال جديدة بنجاح إلى نظام إدارة علاقات العملاء.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    اسم جهة الاتصال
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">البريد الإلكتروني</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">الهاتف</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">المسمى الوظيفي</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">القسم</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">الحساب</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">المستخدم المسؤول</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">العنوان</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    عرض جهة الاتصال
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'da' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Ny kontakt oprettet
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                En ny kontakt er blevet tilføjet til dit CRM-system.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Kontaktnavn</p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">{contact_name}</h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefon</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Jobtitel</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Afdeling</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Konto</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Tildelt bruger</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Adresse</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Se kontakt
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'de' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Neuer Kontakt erstellt
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Ein neuer Kontakt wurde erfolgreich zu Ihrem CRM hinzugefügt.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Kontaktname</p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">{contact_name}</h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-Mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefon</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Jobtitel</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Abteilung</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Konto</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Zugewiesener Benutzer</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Adresse</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Kontakt anzeigen
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'en' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                New Contact Created
                            </h1>

                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                A new contact has been successfully added to your CRM.
                            </p>
                        </div>
                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Contact Name
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                        Email
                                    </td>
                                    <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">
                                        {contact_email}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                        Phone
                                    </td>
                                    <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">
                                        {contact_phone}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                        Job Title
                                    </td>
                                    <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">
                                        {job_title}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                        Department
                                    </td>
                                    <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">
                                        {contact_department}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                        Account
                                    </td>
                                    <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">
                                        {contact_account}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                        Assigned User
                                    </td>
                                    <td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">
                                        {assigned_user}
                                    </td>
                                </tr>
                            </table>
                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Address
                                </p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>
                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    View Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'es' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Nuevo contacto creado
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Un nuevo contacto ha sido añadido correctamente a tu CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Nombre del contacto
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Correo electrónico</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Teléfono</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Puesto</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Departamento</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Cuenta</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Usuario asignado</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Dirección</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Ver contacto
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'fr' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Nouveau contact créé
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Un nouveau contact a été ajouté avec succès à votre CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Nom du contact
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Téléphone</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Poste</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Département</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Compte</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Utilisateur assigné</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Adresse</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Voir le contact
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'it' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Nuovo contatto creato
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Un nuovo contatto è stato aggiunto con successo al tuo CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Nome contatto
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Email</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefono</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Ruolo</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Dipartimento</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Account</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Utente assegnato</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Indirizzo</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Visualizza contatto
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'ja' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                新しい連絡先が作成されました
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                新しい連絡先がCRMに正常に追加されました。
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    連絡先名
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">メール</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">電話</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">役職</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">部署</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">アカウント</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">担当ユーザー</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">住所</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    連絡先を見る
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'nl' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Nieuw contact aangemaakt
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Een nieuw contact is succesvol toegevoegd aan je CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Contactnaam
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefoon</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Functie</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Afdeling</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Account</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Toegewezen gebruiker</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Adres</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Bekijk contact
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'pl' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Utworzono nowy kontakt
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Nowy kontakt został pomyślnie dodany do Twojego CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Nazwa kontaktu
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefon</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Stanowisko</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Dział</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Konto</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Przypisany użytkownik</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Adres</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Zobacz kontakt
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'ru' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Создан новый контакт
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Новый контакт успешно добавлен в вашу CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Имя контакта
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Электронная почта</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Телефон</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Должность</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Отдел</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Аккаунт</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Назначенный пользователь</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Адрес</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Просмотр контакта
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'pt' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Novo contato criado
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Um novo contato foi adicionado com sucesso ao seu CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Nome do contato
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefone</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Cargo</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Departamento</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Conta</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Usuário atribuído</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Endereço</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Ver contato
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'pt-BR' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Novo contato criado
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Um novo contato foi adicionado com sucesso ao seu CRM.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Nome do contato
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-mail</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefone</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Cargo</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Departamento</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Conta</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Usuário atribuído</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Endereço</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Ver contato
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'tr' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                Yeni kişi oluşturuldu
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                Yeni bir kişi CRM\'inize başarıyla eklendi.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    Kişi Adı
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">E-posta</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Telefon</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">İş Ünvanı</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Departman</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Hesap</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">Atanan Kullanıcı</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Adres</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    Kişiyi Görüntüle
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'zh' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                已创建新联系人
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                新的联系人已成功添加到您的 CRM。
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    联系人姓名
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">电子邮件</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">电话</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">职位</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">部门</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">账户</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">分配用户</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">地址</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    查看联系人
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',

                'he' => '<div style="margin:0;padding:40px 20px;background:#f8fafc;font-family:\'Segoe UI\',Arial,sans-serif;direction:rtl;text-align:right;">
                    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                        <div style="padding:40px 30px;text-align:center;background:#4f46e5;">
                            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                                נוצר איש קשר חדש
                            </h1>
                            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                                איש קשר חדש נוסף בהצלחה ל-CRM שלך.
                            </p>
                        </div>

                        <div style="padding:30px;">
                            <div style="margin-bottom:20px;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">
                                    שם איש קשר
                                </p>
                                <h2 style="margin:6px 0 0;font-size:24px;color:#0f172a;">
                                    {contact_name}
                                </h2>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">אימייל</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_email}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">טלפון</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_phone}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">תפקיד</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{job_title}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">מחלקה</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_department}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">חשבון</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{contact_account}</td></tr>
                                <tr><td style="padding:12px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">משתמש משויך</td><td align="right" style="padding:12px 0;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600;">{assigned_user}</td></tr>
                            </table>

                            <div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">כתובת</p>
                                <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">
                                    {contact_address}, {contact_city}, {contact_state}, {contact_country} - {contact_postal_code}
                                </p>
                            </div>

                            <div style="text-align:center;margin-top:30px;">
                                <a href="{app_url}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                                    צפה באיש קשר
                                </a>
                            </div>
                        </div>
                    </div>
                </div>',
                ],
            ],
        ];
        foreach($emailTemplate as $eTemp)
        {     
            $table = EmailTemplate::where('name',$eTemp)->where('module_name','Sales')->exists();
            if(!$table)
            {
                $emailtemplate=  EmailTemplate::create(
                    [
                    'name' => $eTemp,
                    'from' => !empty(env('APP_NAME')) ? env('APP_NAME') : 'Automas ERP',
                    'module_name' => 'Sales',
                    'created_by' => $admin->id,
                    'creator_id' => $admin->id,
                    ]
                );
                foreach($defaultTemplate[$eTemp]['lang'] as $lang => $content)
                {
                    EmailTemplateLang::create(
                        [
                            'parent_id' => $emailtemplate->id,
                            'lang' => $lang,
                            'subject' => $defaultTemplate[$eTemp]['subject'],
                            'variables' => $defaultTemplate[$eTemp]['variables'],
                            'content' => $content,
                        ]
                    );
                }
            }
        }
    }
}