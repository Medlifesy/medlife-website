/* =========================================================
   MEDLIFE MEMBERS API
   POST /api/members

   Public endpoint for submitting a new membership application.
   Sensitive member data is never returned by this endpoint.
========================================================= */

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") {
        return jsonResponse({ success: true });
    }

    if (request.method !== "POST") {
        return jsonResponse({ success: false, error: "Method not allowed." }, 405);
    }

    if (!env.DB) {
        return jsonResponse({
            success: false,
            error: "Database binding 'DB' is not configured."
        }, 500);
    }

    try {
        const body = await request.json();

        const fullName = clean(body.full_name, 150);
        const motherName = clean(body.mother_name, 150);
        const nationalId = clean(body.national_id, 40);
        const email = clean(body.email, 200).toLowerCase();
        const phone = clean(body.phone, 40);
        const gender = clean(body.gender, 20);
        const educationLevel = clean(body.education_level, 150);
        const studyYear = clean(body.study_year, 80);
        const residentSpecialty = clean(body.resident_specialty, 150);
        const residencyYear = clean(body.residency_year, 80);
        const residencyHospital = clean(body.residency_hospital, 200);
        const university = clean(body.university, 250);
        const address = clean(body.address, 500);
        const governorate = clean(body.governorate, 100);
        const medlifeRole = clean(body.medlife_role, 80);
        const cell = clean(body.cell, 80);
        const fieldLocation = clean(body.field_location, 100);
        const joinDate = clean(body.join_date, 30) || new Date().toISOString().slice(0, 10);
        const volunteerCertificate = clean(body.volunteer_certificate, 10) || "no";

        const allowedGender = ["male", "female"];
        const allowedRoles = [
            "volunteer",
            "supervisor",
            "general_supervisor",
            "assistant_supervisor"
        ];
        const allowedCells = [
            "plasma_cell",
            "neuron_cell",
            "astrocyte_cell",
            "leukocyte_cell",
            "heart_cell",
            "red_blood_cell",
            "blog",
            "design",
            "video_editing",
            "visual_media",
            "instagram",
            "telegram",
            "administration",
            "voice_over",
            "coordination",
            "university_media",
            "field"
        ];
        const allowedFieldLocations = [
            "damascus",
            "aleppo",
            "tartous",
            "latakia",
            "homs",
            "hasakah"
        ];
        const allowedCertificates = ["yes", "no"];

        if (!fullName || !motherName || !nationalId || !phone || !gender ||
            !educationLevel || !governorate || !medlifeRole || !cell) {
            return jsonResponse({
                success: false,
                error: "يرجى تعبئة جميع الحقول الأساسية المطلوبة."
            }, 400);
        }

        if (!allowedGender.includes(gender)) {
            return jsonResponse({ success: false, error: "الجنس المحدد غير صالح." }, 400);
        }

        if (!allowedRoles.includes(medlifeRole)) {
            return jsonResponse({ success: false, error: "الصفة داخل MedLife غير صالحة." }, 400);
        }

        if (!allowedCells.includes(cell)) {
            return jsonResponse({ success: false, error: "الخلية المحددة غير صالحة." }, 400);
        }

        if (!allowedCertificates.includes(volunteerCertificate)) {
            return jsonResponse({ success: false, error: "قيمة شهادة التطوع غير صالحة." }, 400);
        }

        if (cell === "field" && !allowedFieldLocations.includes(fieldLocation)) {
            return jsonResponse({
                success: false,
                error: "يرجى اختيار المحافظة للعمل الميداني."
            }, 400);
        }

        if (cell !== "field" && fieldLocation) {
            return jsonResponse({
                success: false,
                error: "لا يمكن تحديد محافظة ميدانية إلا عند اختيار المجال الميداني."
            }, 400);
        }

        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return jsonResponse({ success: false, error: "البريد الإلكتروني غير صالح." }, 400);
        }

        const duplicate = await env.DB.prepare(`
            SELECT id
            FROM members
            WHERE national_id = ?
            LIMIT 1
        `).bind(nationalId).first();

        if (duplicate) {
            return jsonResponse({
                success: false,
                error: "يوجد طلب أو سجل سابق مرتبط بهذا الرقم الوطني."
            }, 409);
        }

        const result = await env.DB.prepare(`
            INSERT INTO members (
                full_name,
                mother_name,
                national_id,
                email,
                phone,
                gender,
                education_level,
                study_year,
                resident_specialty,
                residency_year,
                residency_hospital,
                university,
                address,
                governorate,
                medlife_role,
                cell,
                field_location,
                join_date,
                volunteer_certificate,
                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
            fullName,
            motherName,
            nationalId,
            email,
            phone,
            gender,
            educationLevel,
            studyYear,
            residentSpecialty,
            residencyYear,
            residencyHospital,
            university,
            address,
            governorate,
            medlifeRole,
            cell,
            cell === "field" ? fieldLocation : null,
            joinDate,
            volunteerCertificate
        ).run();

        return jsonResponse({
            success: true,
            message: "تم استلام طلب الانضمام بنجاح، وسيتم مراجعته من فريق MedLife.",
            id: result.meta?.last_row_id ?? null,
            status: "pending"
        }, 201);

    } catch (error) {
        console.error("Members API error:", error);

        if (String(error?.message || "").toLowerCase().includes("unique")) {
            return jsonResponse({
                success: false,
                error: "يوجد سجل سابق مرتبط بهذا الرقم الوطني أو البريد الإلكتروني."
            }, 409);
        }

        return jsonResponse({
            success: false,
            error: "تعذر إرسال طلب الانضمام حالياً."
        }, 500);
    }
}

function clean(value, maxLength = 5000) {
    return String(value ?? "").trim().slice(0, maxLength);
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
    });
}
