<p align="center">
  <img src="assets/banner/mail-aura-banner-ar.webp" width="100%" alt="لا مفاتيح API" />
</p>

<h1 align="center">Mail Aura — مدقّق البريد الإلكتروني ومنظّق القوائم</h1>

<p align="center">تحقّق من عناوين البريد الإلكتروني عبر ثمانية مصادر عامة مجانية، ونظّف القوائم الطويلة بنقرة واحدة، وصدّر النتائج بصيغة CSV — بلا مفتاح API، ولا حساب، ولا تخمين. تأتي الواجهة بثماني لغات، منها دعم RTL كامل للعربية.</p>

<p align="center">
  <a href="https://github.com/el9a7rawi/Mail-Aura/releases"><img src="https://img.shields.io/github/v/release/el9a7rawi/Mail-Aura?color=4f46e5" alt="Latest release" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-E8710A" alt="Apache 2.0" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-22C55E" alt="PRs welcome" /></a>
  <a href="https://developer.chrome.com/docs/extensions"><img src="https://img.shields.io/badge/Manifest-V3-4285F4" alt="Manifest V3" /></a>
  <img src="https://img.shields.io/badge/8_Languages-7c3aed" alt="8 languages" />
  <img src="https://img.shields.io/badge/No_API_Keys-059669" alt="لا مفاتيح API" />
</p>

<h4 align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.de.md">Deutsch</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md"><b>العربية</b></a> · <a href="README.zh-CN.md">中文（简体）</a>
</h4>
<h3 align="center">Download for your browser — click the icon</h3>

<div align="center">

| [<img src="assets/browsers/chrome.svg" width="52" alt="Chrome" /><br><b>Chrome</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/edge.svg" width="52" alt="Edge" /><br><b>Edge</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/firefox.svg" width="52" alt="Firefox" /><br><b>Firefox</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/brave.svg" width="52" alt="Brave" /><br><b>Brave</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/opera.svg" width="52" alt="Opera" /><br><b>Opera</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) |

Chrome ومتصفحات Chromium هي الهدف الأساسي. يدعم Firefox ابتداءً من الإصدار 140 عبر أرشيف مخصص بمانيفست خاص به (إجراء اللوحة الجانبية وسكربت خلفي كلاسيكي).
|---|---|---|---|---|

</div>

---

## 1. لماذا Mail Aura؟

<div align="center">

| بدون Mail Aura | مع Mail Aura |
|---|---|
| التخمين بناءً على الشكل فقط | ثمانية مصادر مستقلة إضافةً إلى إشارات محلية |
| قوائم ملصقة مليئة بالتكرارات | تُزال التكرارات قبل التحقق |
| تنظيف يدوي لملفات CSV | استيراد وتصدير CSV بنقرة واحدة |
| شارة 100% لا تعني شيئاً | درجة صادقة لا تتجاوز 88% للعناوين الصحيحة |

</div>

لا تستطيع أي خدمة عامة أن تثبت وجود صندوق بريد بعينه دون إرسال رسالة فعلية إليه. لذلك يعرض Mail Aura **درجة ثقة** لا ضماناً.

---

## 2. كيف يعمل — ثلاث خطوات

1. **اختر مصدراً** — امسح الصفحة الحالية، أو الصق قائمة، أو حمّل ملف CSV.
2. **تحقّق** — تُفحص العناوين بالتوازي مقابل ثماني خدمات مجانية، مع تخزين النتائج مؤقتاً حسب النطاق.
3. **تصرّف** — انسخ العناوين الصحيحة، أو صحّح الأخطاء الإملائية بنقرة واحدة، أو صدّر كل شيء بصيغة CSV.

---

## 3. جولة في الواجهة — كل جزء من الإضافة

### 3.1 الرأس — كل شيء في متناول اليد
<p align="center"><img src="assets/screenshots/ar/sections/section-header.webp" width="400" alt="الرأس" /></p>

العنوان ومختر اللغة وتبديل الثيم ورابط GitHub وزر اللوحة الجانبية كلها في صف واحد مدمج.

### 3.2 إجراء رئيسي واحد
<p align="center"><img src="assets/screenshots/ar/sections/section-hero.webp" width="400" alt="الإجراء الرئيسي" /></p>

زر واحد بتدرج لوني ينجز العمل للمصدر النشط. تحته مباشرة **نسخ الصالحات** و**تصدير CSV** بنقرة واحدة؛ كما توفر شريط النتائج **نسخ النتائج المعروضة** و**مسح النتائج** وزر نسخ لكل صف. سطر الحالة يخبرك بالضبط بما حدث.

### 3.3 المصدر — الصفحة الحالية
<p align="center"><img src="assets/screenshots/ar/sections/section-source.webp" width="400" alt="مصدر الصفحة" /></p>

امسح فقط العناوين الظاهرة في الصفحة التي تقرأها. لا تُقرأ أي بيانات قبل أن تضغط الزر.

### 3.4 المصدر — القائمة الملصقة
<p align="center"><img src="assets/screenshots/ar/sections/section-manual.webp" width="400" alt="الإدخال اليدوي" /></p>

الصق عنواناً في كل سطر أو افصل بينها بفواصل. تختفي التكرارات قبل التحقق، وتبقى الأسطر غير الصحيحة ظاهرة كنتائج.

### 3.5 المصدر — ملف CSV
<p align="center"><img src="assets/screenshots/ar/sections/section-file.webp" width="400" alt="اختيار CSV" /></p>

بطاقة الملف تعرض الأيقونة واسم الملف المحدد. تُقرأ الأعمدة الأولى فقط، لذا حتى التصديرات الفوضوية تعمل.

### 3.6 النتائج — جوهر المنتج
<p align="center"><img src="assets/screenshots/ar/sections/section-results.webp" width="400" alt="قائمة النتائج" /></p>

كل صف يعرض العنوان وشارة حالة ملونة وسطر سبب وإجراءات خاصة بالصف. شرائح المصادر الاختيارية تعرض معرّفات المصادر التي أجابت فعلاً.

### 3.7 التصفية والبحث
<p align="center"><img src="assets/screenshots/ar/sections/section-filtersearch.webp" width="400" alt="التصفية والبحث المباشر" /></p>

سبع حالات تصفية وحقل بحث قابل للتوسيع يعملان معاً؛ تأخير 80 مللي ثانية يحافظ على سلاسة الكتابة.

### 3.8 التحقق من قائمة السياق

حدد عنوان بريد أو رابط `mailto:` في أي صفحة ثم اختر **التحقق من عنوان البريد هذا**. تظهر النتيجة في النافذة المنبثقة مع احترام وضع الخصوصية، فلا يحدث أي اتصال خارجي عند تفعيله.

### 3.9 الإعدادات
<p align="center"><img src="assets/screenshots/ar/sections/section-options.webp" width="400" alt="الإعدادات" /></p>

وضع الخصوصية وإبراز العناوين في الصفحة وشرائح المصادر والتصحيح التلقائي الاختياري كلها مفاتيح صريحة. التصحيح التلقائي مطفأ افتراضياً، ويصلح فقط أخطاء النطاقات المعروفة في القوائم الملصقة ومسح الصفحة وملفات CSV — بما في ذلك وضع الخصوصية. لا تُخمَّن الأخطاء غير المعروفة أو المتعددة الاحتمالات. تبديل وضع الخصوصية يمسح أيضاً ذاكرة تخزين النطاقات المؤقتة.

### 3.10 ثماني لغات وRTL حقيقي
<p align="center"><img src="assets/screenshots/ar/sections/section-language.webp" width="400" alt="قائمة اللغات" /></p>

التبديل فوراً بين English وEspañol وFrançais وDeutsch وPortuguês (Brasil) وРусский والعربية و中文（简体）. العربية تعكس التخطيط بالكامل بمنطق وليس بمظهر شكلي فقط.

### 3.11 ثيم داكن أسود حقيقي

خلفية سوداء حقيقية بتباين مضبوط، تُفعّل من الرأس وتُتذكر بين الجلسات.

### 3.12 اللوحة الجانبية للقوائم الطويلة
<p align="center"><img src="assets/screenshots/ar/sections/section-side.webp" width="320" alt="اللوحة الجانبية" /></p>

نفس المتحكم ومساحة أوسع وحاوية تمرير واحدة — بلا أشرطة تمرير متداخلة.

### 3.13 الحالة الفارغة
<p align="center"><img src="assets/screenshots/ar/sections/section-empty.webp" width="400" alt="الحالة الفارغة" /></p>

دعوة صادقة للمسح أو اللصق، وليس مربعاً فارغاً أبداً.

### 3.14 دعم التطوير المستمر
<p align="center"><img src="assets/screenshots/ar/sections/section-donate.webp" width="400" alt="قسم الدعم" /></p>

Mail Aura مجاني ومفتوح المصدر. PayPal وخيار InstaPay البارز يساعدان على تحسينه. كلاهما يُفتح في تبويب جديد، والإضافة لا ترسل أي بيانات.
## 4. ثمانية مصادر مجانية

1. Rapid Email Validator
2. Disify
3. DeBounce
4. MailCheck.ai
5. Disban
6. EmailProbe
7. Google DNS-over-HTTPS
8. Cloudflare DNS-over-HTTPS

جميع الاتصالات عبر HTTPS ودون مفتاح، ووضع الخصوصية يعطّلها جميعاً.

---

## 5. التثبيت (غير مجمّع)

1. افتح `chrome://extensions`.
2. فعّل **Developer mode**.
3. انقر **Load unpacked** واختر هذا المجلد.
4. انقر أيقونة Mail Aura في شريط الأدوات.

لا حاجة لخطوة بناء ولا إلى تبعيات خارجية.

---

## 6. التطوير

المستودع المنشور يحتوي على الإضافة ووثائقها فقط. أدوات التطوير والاختبارات المحلية مستبعدة قصداً؛ يتحقق GitHub Actions من الـ manifest وCSP وتطابق اللغات والملفات المضمّنة مع كل دفع.

---

## 7. الخصوصية

راجع `privacy.html`. لا تُرسل العناوين إلا عندما تطلب التحقق، ولا يُتتبّع أي شيء، وكل الاتصالات تستخدم HTTPS. تُحفظ نتيجة قائمة السياق مؤقتاً في storage.session حتى يقرأها الـ popup، وتُخزَّن الإعدادات محلياً. الخطوط مضمّنة محلياً ولا يوجد أي طلب خطوط خارجي.

---

## 8. الترخيص

المشروع مفتوح المصدر ومجاني للجميع بموجب ترخيص **Apache-2.0** — استخدمه، وعدّله، وشاركه بحرية؛ والنص الكامل في [LICENSE](LICENSE).

---

<p align="center">بُني بعناية بواسطة <b>Ahmed Yousry</b> · <a href="https://github.com/el9a7rawi/Mail-Aura">Mail Aura</a> · <a href="LICENSE">Apache-2.0</a></p>
