import { json } from './_auth.js';

export async function onRequest({ request, env }) {
  if (!env.MEMBERS_DB) return json({ success:false, error:'Database binding is not configured.' },500);
  if (request.method !== 'GET') return json({ success:false, error:'Method not allowed.' },405);

  try {
    // Final public-data correction for the MedLife support page.
    // The completed orphan initiative is marked completed and fully distributed.
    // We deliberately do not invent a final total because the public statement is “more than 75” beneficiaries.
    await env.MEMBERS_DB.prepare(`
      UPDATE support_cases
      SET status='funded',
          funded_amount=0,
          spent_amount=0,
          financial_status='verified',
          beneficiary_count=75,
          beneficiary_label='أكثر من 75',
          duration_months=6,
          monthly_per_beneficiary=15000,
          start_date='2026-01-01',
          end_date='2026-06-30',
          progress_stage='completed',
          verification_status='documented_internal',
          public_status_note='مبادرة مكتملة ومنفذة بالكامل؛ تم توزيع كامل المبلغ المقرر وفق سجل الصرف الداخلي. العدد المنشور هو أكثر من 75، لذلك لا يتم اختلاق إجمالي نهائي للصرف في الصفحة العامة.'
      WHERE code='ML-IMPACT-ORPHANS-2026'
    `).run();

    await env.MEMBERS_DB.prepare(`
      UPDATE support_cases
      SET status='active',
          target_amount=10000,
          funded_amount=0,
          spent_amount=0,
          financial_status='not_published',
          start_date='2026-08-01',
          end_date='2026-12-31',
          duration_months=6,
          verification_status='confirmed_initial',
          progress_stage='fundraising',
          public_status_note='التأكيد الأولي مكتمل؛ جمع الدعم مفتوح حالياً.'
      WHERE code='ML-OPEN-ORPHAN-SCHOOL-2026'
    `).run();

    const rows = await env.MEMBERS_DB.prepare(`
      SELECT code,title,status,target_amount,funded_amount,spent_amount,beneficiary_label,duration_months,
             monthly_per_beneficiary,start_date,end_date,financial_status,verification_status,progress_stage,public_status_note
      FROM support_cases
      WHERE code IN ('ML-IMPACT-ORPHANS-2026','ML-OPEN-ORPHAN-SCHOOL-2026')
      ORDER BY CASE WHEN status='active' THEN 0 ELSE 1 END
    `).all();

    return json({success:true,message:'Support data finalized.',cases:rows.results||[]});
  } catch (e) {
    return json({success:false,error:e.message||'Unable to finalize support data.'},500);
  }
}
