export const POLICY_SLUGS = ['returns-refunds', 'shipping-delivery', 'privacy', 'terms', 'complaints'] as const
export type PolicySlug = (typeof POLICY_SLUGS)[number]
type Section = { title: string; paragraphs?: string[]; bullets?: string[] }
export type PolicyContent = {
  slug: PolicySlug
  shortTitle: string
  title: string
  summary: string
  icon: 'rotate' | 'truck' | 'shield' | 'file' | 'message'
  accent: string
  highlights: string[]
  sections: Section[]
}

const ar: Record<PolicySlug, PolicyContent> = {
  'returns-refunds': {
    slug: 'returns-refunds', shortTitle: 'الاسترجاع والاستبدال',
    title: 'سياسة الاستبدال والاسترجاع واسترداد الأموال',
    summary: 'نوضح لك متى وكيف يمكن إرجاع المنتج أو استبداله، ومن يتحمل تكاليف الإرجاع.',
    icon: 'rotate', accent: 'from-blue-600 to-cyan-500',
    highlights: ['7 أيام لطلب الاسترجاع', 'فحص المنتج قبل قبول الطلب', 'حماية المنتج المعيب'],
    sections: [
      { title: 'مدة وشروط الاسترجاع', paragraphs: ['يحق للعميل طلب استرجاع المنتج خلال 7 أيام من تاريخ الاستلام، مع مراعاة الحقوق والاستثناءات المقررة نظامًا.'], bullets: ['أن يكون المنتج غير مستخدم أو مشغّل وبحالته الأصلية.', 'إعادة التغليف والملحقات والفاتورة مع المنتج.', 'ألا يكون المنتج مصنّعًا أو مجهزًا حسب طلب العميل أو بمواصفات خاصة.', 'لا تُقبل الأدوات الاستهلاكية التي تم تشغيلها، مثل شفرات وأقراص القطع والجلخ والحفر، إلا عند وجود عيب مشمول بالحقوق النظامية.'] },
      { title: 'المنتج التالف أو الخاطئ', paragraphs: ['إذا وصل المنتج تالفًا أو معيبًا أو مختلفًا عن الطلب، تتولى المؤسسة معالجة الحالة وتتحمل تكلفة الإرجاع أو الاستبدال بعد التحقق منها. يُرجى التواصل فور اكتشاف المشكلة وإرفاق صور واضحة.'] },
      { title: 'تكلفة الإرجاع', bullets: ['عند تغيير رأي العميل: يتحمل العميل تكلفة إعادة المنتج، ولا تُرد رسوم الشحن الأصلية.', 'عند وجود خطأ من المؤسسة أو عيب في المنتج: تتحمل المؤسسة تكلفة الإرجاع أو الاستبدال.'] },
      { title: 'الفحص واسترداد المبلغ', paragraphs: ['يُفحص المنتج بعد استلامه. وعند قبول طلب الاسترجاع، يُعاد المبلغ المستحق إلى وسيلة الدفع الأصلية. وقد تختلف مدة ظهور المبلغ بحسب البنك أو مزود الدفع.'] },
      { title: 'طريقة تقديم الطلب', paragraphs: ['يمكن تقديم الطلب عبر البريد info@diamondtools-est.com أو الهاتف وواتساب +966 54 601 0202، أو تسليم المنتج إلى أحد الفروع بعد التنسيق المسبق.'] },
    ],
  },
  'shipping-delivery': {
    slug: 'shipping-delivery', shortTitle: 'الشحن والتوصيل', title: 'سياسة الشحن والتوصيل',
    summary: 'تفاصيل رسوم التوصيل، الاستلام من الفروع، ومسؤوليات تجهيز واستلام الطلب.',
    icon: 'truck', accent: 'from-amber-500 to-orange-500',
    highlights: ['25 ريالًا للتوصيل', 'توصيل مجاني من 200 ريال', 'استلام متاح من الفروع'],
    sections: [
      { title: 'نطاق الخدمة', paragraphs: ['نوفر التوصيل داخل المملكة العربية السعودية، إضافة إلى إمكانية الاستلام من الفروع المتاحة عند اختيار ذلك أثناء إتمام الطلب.'] },
      { title: 'رسوم التوصيل', bullets: ['25 ريالًا للطلبات التي تقل قيمتها عن 200 ريال.', 'توصيل مجاني للطلبات التي تبلغ قيمتها 200 ريال أو أكثر.', 'تظهر الرسوم والضريبة والإجمالي النهائي بوضوح قبل تأكيد الطلب.', 'قد تتطلب المنتجات الكبيرة أو الثقيلة ترتيبات وتكلفة خاصة، ويتم إبلاغ العميل قبل التنفيذ.'] },
      { title: 'تجهيز وتسليم الطلب', paragraphs: ['يبدأ تجهيز الطلب بعد تأكيده وقبول وسيلة الدفع. تختلف مدة التوصيل بحسب المدينة وتوفر المنتج وحجم الشحنة، ويتم تزويد العميل بالمعلومات المتاحة عن حالة طلبه.'] },
      { title: 'دقة بيانات العنوان', paragraphs: ['يتحمل العميل مسؤولية إدخال عنوان ورقم هاتف صحيحين. وقد يتأخر الطلب أو تُحتسب رسوم إضافية عند تعذر التسليم بسبب بيانات غير صحيحة أو عدم تجاوب المستلم.'] },
      { title: 'التأخير والإلغاء', paragraphs: ['إذا تأخر التسليم أكثر من 15 يومًا عن الموعد المتفق عليه، يحق للعميل طلب إلغاء العملية وفق الأحكام النظامية، ما لم يكن التأخير ناتجًا عن قوة قاهرة أو سبب خارج عن السيطرة.'] },
    ],
  },
  privacy: {
    slug: 'privacy', shortTitle: 'الخصوصية', title: 'سياسة الخصوصية وحماية البيانات',
    summary: 'كيف نجمع بياناتك ونستخدمها ونحميها عند تصفح المتجر أو تنفيذ طلب.',
    icon: 'shield', accent: 'from-emerald-600 to-teal-500',
    highlights: ['لا نبيع بياناتك', 'دفع عبر مزود متخصص', 'جمع الحد اللازم للخدمة'],
    sections: [
      { title: 'البيانات التي نجمعها', bullets: ['الاسم والبريد الإلكتروني ورقم الهاتف.', 'عنوان الشحن والمدينة وبيانات الاستلام.', 'معلومات الحساب والطلبات والفواتير.', 'رسائل التواصل وطلبات عروض الأسعار.', 'بيانات تقنية ضرورية لأمان الموقع والتحليل وتحسين الخدمة.'] },
      { title: 'لماذا نستخدم البيانات؟', bullets: ['إنشاء الحساب وتنفيذ الطلبات والتوصيل والاسترجاع.', 'التواصل بشأن الطلب أو الاستفسار وخدمة العملاء.', 'معالجة المدفوعات ومنع الاحتيال وحماية الموقع.', 'التحليل وتحسين المتجر والوفاء بالمتطلبات النظامية والمحاسبية.'] },
      { title: 'مشاركة البيانات', paragraphs: ['قد نشارك الحد اللازم من البيانات مع مزودي الدفع والشحن والاستضافة والخدمات التقنية لتنفيذ الخدمة. لا تبيع المؤسسة البيانات الشخصية لأطراف أخرى.'] },
      { title: 'بيانات الدفع', paragraphs: ['تُعالج بيانات البطاقة عبر مزود دفع متخصص، ولا يحتفظ المتجر ببيانات البطاقة الكاملة. تخضع المعالجة كذلك لشروط وسياسات مزود الدفع.'] },
      { title: 'حقوقك والتواصل', paragraphs: ['يمكن طلب الوصول إلى البيانات أو تصحيحها أو حذفها متى كان ذلك متاحًا نظامًا، عبر info@diamondtools-est.com. وقد نحتفظ ببعض البيانات للمدة اللازمة للوفاء بالالتزامات النظامية.'] },
    ],
  },
  terms: {
    slug: 'terms', shortTitle: 'الشروط والأحكام', title: 'الشروط والأحكام',
    summary: 'القواعد المنظمة لاستخدام المتجر والشراء واختيار الأدوات والمعدات المناسبة.',
    icon: 'file', accent: 'from-violet-600 to-indigo-500',
    highlights: ['أسعار واضحة قبل التأكيد', 'استخدام آمن ومسؤول', 'تطبيق أنظمة المملكة'],
    sections: [
      { title: 'قبول الشروط', paragraphs: ['باستخدام المتجر أو تنفيذ طلب، يوافق العميل على هذه الشروط والسياسات المنشورة. يجب إدخال معلومات صحيحة وكاملة عند التسجيل أو الطلب.'] },
      { title: 'المنتجات والتوفر', paragraphs: ['نسعى لعرض معلومات وصور دقيقة. وقد توجد فروقات بسيطة لا تؤثر في المواصفات الأساسية. عرض المنتج لا يضمن توفره حتى يتم تأكيد الطلب.'] },
      { title: 'الأسعار والدفع', bullets: ['الأسعار بالريال السعودي، ويظهر إجمالي الضريبة والشحن قبل تأكيد الطلب.', 'يجوز تصحيح الخطأ الواضح في السعر أو الوصف مع إبلاغ العميل وإتاحة الإلغاء واسترداد المبلغ.', 'يحق للمؤسسة رفض أو إلغاء طلب متعذر التوفر أو مشتبه به، مع إعادة أي مبلغ تم تحصيله.'] },
      { title: 'السلامة واختيار المنتج', paragraphs: ['يجب استخدام الأدوات والمعدات حسب تعليمات الشركة المصنّعة ومتطلبات السلامة. يتحمل المستخدم مسؤولية التأكد من ملاءمة المنتج لتطبيقه وماكينته، ويمكن طلب المشورة الفنية قبل الشراء.'] },
      { title: 'الضمان والأنظمة', paragraphs: ['الضمان، إن وجد، يخضع لشروط الشركة المصنّعة أو الوكيل، مع عدم الإخلال بالحقوق النظامية. تخضع المعاملات لأنظمة المملكة العربية السعودية.'] },
    ],
  },
  complaints: {
    slug: 'complaints', shortTitle: 'الشكاوى والمقترحات', title: 'سياسة الشكاوى والمقترحات',
    summary: 'قنوات واضحة لإرسال الشكوى، المعلومات المطلوبة، وطريقة متابعة المعالجة.',
    icon: 'message', accent: 'from-rose-600 to-pink-500',
    highlights: ['قنوات تواصل مباشرة', 'توثيق ومراجعة الشكوى', 'متابعة حتى إغلاق الحالة'],
    sections: [
      { title: 'قنوات التواصل', bullets: ['البريد الإلكتروني: info@diamondtools-est.com', 'الهاتف وواتساب: +966 54 601 0202', 'نموذج تواصل معنا في المتجر.'] },
      { title: 'المعلومات المطلوبة', bullets: ['رقم الطلب واسم العميل ومعلومات التواصل.', 'وصف واضح للمشكلة والنتيجة المطلوبة.', 'صور أو فيديو عند وجود تلف أو عيب أو اختلاف في المنتج.'] },
      { title: 'آلية المعالجة', paragraphs: ['تُسجل الشكوى وتُراجع المعلومات المرفقة، ثم يتواصل الفريق مع العميل بالنتيجة أو بطلب معلومات إضافية. تختلف مدة المعالجة بحسب نوع الحالة وتعاون الأطراف ذات العلاقة.'] },
      { title: 'التصعيد', paragraphs: ['إذا لم تُحل الحالة من التواصل الأول، يمكن للعميل طلب تصعيدها للمسؤول المختص مع ذكر رقم الطلب وتفاصيل التواصل السابق.'] },
      { title: 'الحقوق النظامية', paragraphs: ['تُعالج الشكاوى بما يحفظ حقوق العميل والمؤسسة وفق الأنظمة والسياسات المعلنة، ولا تمنع هذه السياسة العميل من استخدام القنوات النظامية المتاحة.'] },
    ],
  },
}

const en: Record<PolicySlug, PolicyContent> = {
  'returns-refunds': { slug: 'returns-refunds', shortTitle: 'Returns & refunds', title: 'Returns, Exchanges & Refunds Policy', summary: 'When and how a product can be returned or exchanged, and who covers the return cost.', icon: 'rotate', accent: 'from-blue-600 to-cyan-500', highlights: ['7-day return request window', 'Inspection before approval', 'Defective product protection'], sections: [
    { title: 'Return window and conditions', paragraphs: ['A return may be requested within 7 days of delivery, subject to applicable statutory rights and exceptions.'], bullets: ['The product must be unused and in its original condition.', 'Original packaging, accessories and invoice must be included.', 'Made-to-order or custom-specification products are excluded.', 'Used consumables such as cutting, grinding and drilling blades or discs cannot be returned unless defective under applicable rights.'] },
    { title: 'Damaged, defective or incorrect items', paragraphs: ['If an item arrives damaged, defective or different from the order, we will review the case and cover the return or replacement cost once verified. Please contact us promptly and include clear photos.'] },
    { title: 'Return costs', bullets: ['Change of mind: the customer covers return shipping and the original delivery fee is not refundable.', 'Our error or a defective item: we cover the return or replacement cost.'] },
    { title: 'Inspection and refund', paragraphs: ['Returned products are inspected on receipt. Once approved, the eligible amount is refunded to the original payment method. Posting time may vary by bank or payment provider.'] },
    { title: 'How to request a return', paragraphs: ['Email info@diamondtools-est.com, call or WhatsApp +966 54 601 0202, or arrange a branch return with us in advance.'] },
  ] },
  'shipping-delivery': { slug: 'shipping-delivery', shortTitle: 'Shipping & delivery', title: 'Shipping & Delivery Policy', summary: 'Delivery fees, branch collection and responsibilities during order fulfilment.', icon: 'truck', accent: 'from-amber-500 to-orange-500', highlights: ['SAR 25 delivery fee', 'Free delivery from SAR 200', 'Branch collection available'], sections: [
    { title: 'Service area', paragraphs: ['We deliver within Saudi Arabia and offer collection from available branches when selected during checkout.'] },
    { title: 'Delivery fees', bullets: ['SAR 25 for orders below SAR 200.', 'Free delivery for orders of SAR 200 or more.', 'Fees, VAT and the final total are shown before confirmation.', 'Large or heavy products may require special arrangements and charges, confirmed before fulfilment.'] },
    { title: 'Order preparation and delivery', paragraphs: ['Preparation begins after order confirmation and payment acceptance. Delivery time varies by city, availability, size and weight.'] },
    { title: 'Address accuracy', paragraphs: ['Customers must provide an accurate address and reachable phone number. Incorrect details or an unavailable recipient may cause delay or additional cost.'] },
    { title: 'Delay and cancellation', paragraphs: ['If delivery is delayed by more than 15 days beyond the agreed date, the customer may request cancellation under applicable law, except for force majeure or circumstances beyond reasonable control.'] },
  ] },
  privacy: { slug: 'privacy', shortTitle: 'Privacy', title: 'Privacy & Data Protection Policy', summary: 'How we collect, use and protect information when you browse or place an order.', icon: 'shield', accent: 'from-emerald-600 to-teal-500', highlights: ['We do not sell your data', 'Specialist payment processing', 'Only necessary data is collected'], sections: [
    { title: 'Information we collect', bullets: ['Name, email and phone number.', 'Delivery address, city and collection details.', 'Account, order and invoice information.', 'Messages and quotation requests.', 'Technical data needed for security, analytics and improvement.'] },
    { title: 'How we use information', bullets: ['Accounts, orders, delivery and returns.', 'Customer service and order communication.', 'Payment processing, fraud prevention and security.', 'Analytics, accounting and legal compliance.'] },
    { title: 'Sharing information', paragraphs: ['We share only necessary information with payment, delivery, hosting and technical providers. We do not sell personal information.'] },
    { title: 'Payment information', paragraphs: ['Card data is processed by a specialist payment provider. The store does not retain full card details.'] },
    { title: 'Your choices', paragraphs: ['Where legally available, request access, correction or deletion via info@diamondtools-est.com. Certain records may be retained for legal obligations.'] },
  ] },
  terms: { slug: 'terms', shortTitle: 'Terms & conditions', title: 'Terms & Conditions', summary: 'Rules for using the store, purchasing and selecting suitable industrial tools.', icon: 'file', accent: 'from-violet-600 to-indigo-500', highlights: ['Clear totals before confirmation', 'Safe and responsible use', 'Saudi laws apply'], sections: [
    { title: 'Acceptance', paragraphs: ['By using the store or placing an order, you agree to these terms and published policies. Information must be accurate and complete.'] },
    { title: 'Products and availability', paragraphs: ['We aim for accurate information and images. Minor differences may occur. Display does not guarantee availability until confirmation.'] },
    { title: 'Prices and payment', bullets: ['Prices are in Saudi Riyals; VAT, delivery and the final total are shown before confirmation.', 'Obvious pricing or description errors may be corrected with an option to cancel and receive a refund.', 'We may reject an unavailable or suspected fraudulent order and refund any collected amount.'] },
    { title: 'Safety and product selection', paragraphs: ['Use tools according to manufacturer instructions and safety requirements. Users are responsible for confirming suitability and may request advice before purchase.'] },
    { title: 'Warranty and governing law', paragraphs: ['Any warranty follows manufacturer or distributor terms without limiting statutory rights. Saudi Arabian law applies.'] },
  ] },
  complaints: { slug: 'complaints', shortTitle: 'Complaints', title: 'Complaints & Feedback Policy', summary: 'Clear channels for raising a complaint and how it is reviewed and followed up.', icon: 'message', accent: 'from-rose-600 to-pink-500', highlights: ['Direct contact channels', 'Documented case review', 'Follow-up through closure'], sections: [
    { title: 'Contact channels', bullets: ['Email: info@diamondtools-est.com', 'Phone and WhatsApp: +966 54 601 0202', 'The Contact Us form.'] },
    { title: 'Information to include', bullets: ['Order number, name and contact details.', 'A clear description and requested outcome.', 'Photos or video for damage, defects or incorrect items.'] },
    { title: 'Review process', paragraphs: ['We register and review the information, then respond with an outcome or request more details. Timeframes vary by case.'] },
    { title: 'Escalation', paragraphs: ['If unresolved at first contact, request escalation and include the order number and earlier correspondence.'] },
    { title: 'Statutory rights', paragraphs: ['Complaints are handled under published policies and applicable rights. Official channels remain available to customers.'] },
  ] },
}

export function getPolicies(locale: string) { return locale === 'ar' ? ar : en }
export function getPolicy(locale: string, slug: string): PolicyContent | null {
  if (!POLICY_SLUGS.includes(slug as PolicySlug)) return null
  return getPolicies(locale)[slug as PolicySlug]
}
