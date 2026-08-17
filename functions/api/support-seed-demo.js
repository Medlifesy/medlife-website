/* MedLife Support Fund — demo data seeder. The 15 completed records are explicitly SAMPLE/DEMO records and must not be presented as historical disbursements. */
import { json } from './_auth.js';
const DEMO_CASES=[
['ML-DEMO-001','عملية جراحية لطفل — نموذج توضيحي','طرطوس','عملية جراحية ومساهمة علاجية',1250000],
['ML-DEMO-002','كرسي متحرك لمريض — نموذج توضيحي','بانياس','تأمين كرسي متحرك ومستلزمات حركة',850000],
['ML-DEMO-003','أدوية لمريض مزمن — نموذج توضيحي','حمص','تأمين أدوية علاجية',420000],
['ML-DEMO-004','فحوصات واستقصاءات طبية — نموذج توضيحي','اللاذقية','تحاليل وصور واستقصاءات',380000],
['ML-DEMO-005','سماعة أذن لطفل — نموذج توضيحي','طرطوس','جهاز سمعي ومستلزماته',1100000],
['ML-DEMO-006','عملية عينية — نموذج توضيحي','دمشق','مساهمة في تكاليف علاج عيني',950000],
['ML-DEMO-007','أدوات مساعدة على الحركة — نموذج توضيحي','حماة','عكازات ومستلزمات حركة',275000],
['ML-DEMO-008','جلسات إعادة تأهيل — نموذج توضيحي','طرطوس','جلسات علاج وتأهيل',600000],
['ML-DEMO-009','حليب ومستلزمات طفل — نموذج توضيحي','جبلة','احتياجات غذائية وصحية',330000],
['ML-DEMO-010','علاج دوائي متخصص — نموذج توضيحي','حلب','أدوية ومتابعة علاجية',720000],
['ML-DEMO-011','سرير طبي لمريض — نموذج توضيحي','بانياس','سرير طبي ومستلزمات رعاية',1400000],
['ML-DEMO-012','علاج أسنان — نموذج توضيحي','حمص','فحوص وعلاج سني',500000],
['ML-DEMO-013','مستلزمات مدرسية لطفل يتيم — نموذج توضيحي','حماة','حقيبة وقرطاسية وملابس مدرسية',250000],
['ML-DEMO-014','مستلزمات علاجية لأسرة — نموذج توضيحي','اللاذقية','مستلزمات طبية أساسية',460000],
['ML-DEMO-015','علاج طفل مصاب بمرض مزمن — نموذج توضيحي','طرطوس','مساهمة علاجية ومتابعة',1050000]
];
export async function onRequest({request,env}){
 if(request.method!=='POST')return json({success:false,error:'Method not allowed.'},405);
 if(!env.MEMBERS_DB)return json({success:false,error:'Database binding is not configured.'},500);
 if(!env.ADMIN_API_KEY||request.headers.get('X-Admin-Key')!==env.ADMIN_API_KEY)return json({success:false,error:'غير مصرح.'},401);
 try{
  await env.MEMBERS_DB.prepare(`CREATE TABLE IF NOT EXISTS support_cases(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL UNIQUE,type TEXT NOT NULL DEFAULT 'case',title TEXT NOT NULL,summary TEXT,description TEXT,target_amount INTEGER NOT NULL DEFAULT 0,funded_amount INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'active',urgent INTEGER NOT NULL DEFAULT 0,governorate TEXT,public_notes TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  const add=async(n,d)=>{try{await env.MEMBERS_DB.prepare(`ALTER TABLE support_cases ADD COLUMN ${n} ${d}`).run()}catch(_) {}};
  await add('beneficiary_count','INTEGER NOT NULL DEFAULT 0');await add('spent_amount','INTEGER NOT NULL DEFAULT 0');await add('amount_basis','TEXT');await add('financial_status',"TEXT NOT NULL DEFAULT 'not_published'");await add('verification_status',"TEXT NOT NULL DEFAULT 'internal_review'");await add('support_type','TEXT');await add('areas','TEXT');
  for(const [code,title,gov,type,amount] of DEMO_CASES){const old=amount*100;await env.MEMBERS_DB.prepare(`INSERT OR IGNORE INTO support_cases(code,type,title,summary,description,target_amount,funded_amount,status,urgent,governorate,public_notes,beneficiary_count,spent_amount,amount_basis,financial_status,verification_status,support_type,areas) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(code,'sample',title,'حالة نموذجية توضيحية لعرض طريقة توثيق أثر صندوق الدعم.','بيانات تجريبية لأغراض التصميم والشرح فقط. لا تمثل هذه الحالة مساعدة مالية نفذتها MedLife ولا يجب اعتمادها كسجل صرف فعلي.',amount,amount,'funded',0,gov,`حالة نموذجية — مبلغ توضيحي: ${amount.toLocaleString('ar-SY')} ل.س جديدة = ${old.toLocaleString('ar-SY')} ل.س قديمة. لا تمثل صرفاً فعلياً.`,1,0,`${amount.toLocaleString('ar-SY')} ل.س جديدة = ${old.toLocaleString('ar-SY')} ل.س قديمة — قيمة نموذجية للتصميم فقط.`,'demo_only','demo',type,gov).run()}
  await env.MEMBERS_DB.prepare(`INSERT OR IGNORE INTO support_cases(code,type,title,summary,description,target_amount,funded_amount,status,urgent,governorate,public_notes,beneficiary_count,verification_status,support_type,areas,amount_basis,financial_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind('ML-OPEN-ORPHAN-SCHOOL-2026','case','طفلة يتيمة بحاجة إلى دعم تعليمي ولوجستي — طرطوس','حالة بحاجة إلى دعم لتأمين مستلزمات المدرسة والمواصلات والاحتياجات التعليمية الأساسية.','تمت مراجعة الحالة مبدئياً مع الحفاظ الكامل على خصوصية الطفلة. لا يتم نشر الاسم أو الصورة أو العنوان أو أي معلومات تعريفية. الحالة تجاوزت مرحلة التأكيد الأولي وأصبحت جاهزة لمرحلة جمع الدعم.',10000,0,'active',1,'طرطوس','المبلغ المستهدف: 10,000 ل.س جديدة = 1,000,000 ل.س قديمة. المبلغ المجموع حالياً: 0 ل.س جديدة = 0 ل.س قديمة (0%). المرحلة: تم اجتياز التأكيد الأولي، والحالة الآن مفتوحة لجمع الدعم.',1,'confirmed','دعم تعليمي ولوجستي','طرطوس','10,000 ل.س جديدة = 1,000,000 ل.س قديمة','not_published').run();
  return json({success:true,message:'تمت إضافة 15 حالة نموذجية وحالة الدعم المفتوحة. الحالات النموذجية موسومة بوضوح بأنها Demo ولا تمثل صرفاً فعلياً.',demo_cases:15});
 }catch(e){console.error(e);return json({success:false,error:'تعذر تجهيز بيانات صندوق الدعم.'},500)}
}
