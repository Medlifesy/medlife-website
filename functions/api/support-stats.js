/* Public, privacy-safe support fund statistics. */
import { json } from './_auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ success: false, error: 'Method not allowed.' }, 405);
  if (!env.MEMBERS_DB) return json({ success: false, error: 'Database binding is not configured.' }, 500);

  try {
    const db = env.MEMBERS_DB;
    const completed = await db.prepare(`
      SELECT COUNT(*) AS count,
             COALESCE(SUM(spent_amount),0) AS amount
      FROM support_cases
      WHERE type='case' AND status='funded'
    `).first();

    const open = await db.prepare(`
      SELECT COUNT(*) AS count
      FROM support_cases
      WHERE type='case' AND status='active'
    `).first();

    const review = await db.prepare(`
      SELECT COUNT(*) AS count
      FROM support_applications
      WHERE status IN ('pending','under_review')
    `).first();

    const orphan = await db.prepare(`
      SELECT beneficiary_count, beneficiary_label, duration_months,
             monthly_per_beneficiary, spent_amount, start_date, end_date,
             financial_status, verification_status, progress_stage
      FROM support_cases
      WHERE code='ML-IMPACT-ORPHANS-2026'
      LIMIT 1
    `).first();

    const openCase = await db.prepare(`
      SELECT code, title, summary, target_amount, funded_amount,
             governorate, duration_months, start_date, end_date,
             verification_status, progress_stage, public_status_note
      FROM support_cases
      WHERE code='ML-OPEN-ORPHAN-SCHOOL-2026' AND status='active'
      LIMIT 1
    `).first();

    return json({
      success: true,
      stats: {
        completedCount: Number(completed?.count || 0),
        completedAmount: Number(completed?.amount || 0),
        openCount: Number(open?.count || 0),
        reviewCount: Number(review?.count || 0)
      },
      orphanInitiative: orphan ? {
        beneficiaryCount: Number(orphan.beneficiary_count || 0),
        beneficiaryLabel: orphan.beneficiary_label || '+75',
        durationMonths: Number(orphan.duration_months || 0),
        monthlyPerBeneficiary: Number(orphan.monthly_per_beneficiary || 0),
        minimumCalculatedAmount: Number(orphan.spent_amount || 0),
        startDate: orphan.start_date,
        endDate: orphan.end_date,
        financialStatus: orphan.financial_status,
        verificationStatus: orphan.verification_status,
        progressStage: orphan.progress_stage
      } : null,
      openCase: openCase ? {
        code: openCase.code,
        title: openCase.title,
        summary: openCase.summary,
        targetAmount: Number(openCase.target_amount || 0),
        fundedAmount: Number(openCase.funded_amount || 0),
        governorate: openCase.governorate,
        durationMonths: Number(openCase.duration_months || 0),
        startDate: openCase.start_date,
        endDate: openCase.end_date,
        verificationStatus: openCase.verification_status,
        progressStage: openCase.progress_stage,
        publicStatusNote: openCase.public_status_note
      } : null
    });
  } catch (error) {
    return json({ success: false, error: 'تعذر تحميل إحصاءات صندوق الدعم حالياً.' }, 500);
  }
}
