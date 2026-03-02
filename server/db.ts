import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    user_agent TEXT,
    page TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default settings
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
insertSetting.run('home_title', 'شريكك الموثوق في التوريدات العامة');
insertSetting.run('home_subtitle', 'الخيار الأول للشركات في مصر');
insertSetting.run('home_description', 'شركة إنترماكس للتوكيلات التجارية تقدم حلولاً متكاملة ومتميزة في مجال التوريدات العامة داخل جمهورية مصر العربية.');
insertSetting.run('about_title', 'من نحن');
insertSetting.run('about_description', 'تتشرف شركة انترماكس للتوكيلات التجارية بأن تقدم نفسها كإحدى الشركات المتخصصة في مجال التوريدات العامة. تأسست الشركة في عام 2025 بهدف تقديم حلول متكاملة ومتميزة لعملائها داخل جمهورية مصر العربية.');
insertSetting.run('about_vision', 'أن نكون الشريك الرائد والموثوق في مجال التوريدات العامة والتصدير داخل جمهورية مصر العربية وخارجها، من خلال تقديم حلول متكاملة عالية الجودة.');
insertSetting.run('about_development', 'نلتزم بالتطوير والتحسين الدائم لخدماتنا ومنظومة أعمالنا، بما يواكب متغيرات السوق المحلية والعالمية، ويعزز قدرتنا على تقديم حلول مبتكرة.');
insertSetting.run('about_team', 'نعتز بفريق عمل يتمتع بخبرة واسعة وكفاءة عالية، يعمل بروح التعاون والالتزام، مما أسهم في بناء سمعة قوية وعلاقات شراكة ناجحة ومستدامة.');
insertSetting.run('about_quality', 'نلتزم بتطبيق أعلى معايير الجودة في جميع المنتجات والخدمات التي نقدمها، لضمان تحقيق رضا عملائنا وتعزيز الثقة المستدامة في تعاملاتنا.');
insertSetting.run('sectors_title', 'قطاعات العمل');
insertSetting.run('sectors_subtitle', 'نقدم خدماتنا المتكاملة عبر مجموعة واسعة من القطاعات لتلبية كافة احتياجات عملائنا');
insertSetting.run('contact_title', 'تواصل معنا');
insertSetting.run('contact_subtitle', 'نحن هنا للإجابة على استفساراتكم وتلبية احتياجاتكم. لا تترددوا في التواصل معنا.');
insertSetting.run('contact_address', 'جمهورية مصر العربية');
insertSetting.run('contact_phone', '+20 100 000 0000');
insertSetting.run('contact_email', 'info@intermax-info.com');
insertSetting.run('contact_hours', 'الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً');
insertSetting.run('footer_about', 'شركة رائدة في مجال التوريدات العامة والتوكيلات التجارية، نقدم حلولاً متكاملة لعملائنا في مختلف القطاعات.');

// Insert default admin if not exists
import bcrypt from 'bcryptjs';
const adminEmail = 'admin@intermax-info.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Admin',
    adminEmail,
    hashedPassword,
    'admin'
  );
}

// Insert default sections if empty
const sectionsCount = db.prepare('SELECT COUNT(*) as count FROM sections').get() as { count: number };
if (sectionsCount.count === 0) {
  const insertSection = db.prepare('INSERT INTO sections (title, description) VALUES (?, ?)');
  insertSection.run('قطاع خدمات الفنادق', 'تقدم الشركة منظومة توريد متكاملة لقطاع الفنادق، تشمل توريد اللوازم الاستهلاكية للفنادق، توريد الأدوات الصحية والكهربائية لغرف النزلاء والمطابخ والمغاسل، توريد الأجهزة الكهربائية بمختلف أنواعها، توريد مواد النظافة والمستلزمات التشغيلية، توفير الخامات ومواد الصيانة اللازمة، دعم كامل لتغطية الاحتياجات اليومية والسنوية.');
  insertSection.run('قطاع توريدات الأوراق', 'ورق A4 – A3 أوزان 70 جم و 80 جم. توفير كميات كبيرة للتوريد المستمر.');
  insertSection.run('قطاع المستلزمات والأدوات المكتبية', 'كافة الأدوات المكتبية، أحبار الطابعات بأنواعها، توريد الطابعات حسب متطلبات العميل.');
  insertSection.run('قطاع مواد البناء', 'رخام – سيراميك – أسمنت – رمل – طوب.');
  insertSection.run('قطاع الحديد وتشكيل المعادن', 'ألواح الحديد، تشكيلات المعادن: خوص – زوايا – علب.');
  insertSection.run('قطاع الأجهزة الكهربائية', 'أجهزة كهربائية من ماركات: فيليبس – تورنيدو – فريش. منتجات صينية وتركية حسب الطلب.');
  insertSection.run('القطاع الصحي (الأدوات الصحية)', 'مصر الحجاز – مصر النور – الشريف – إيبيكو – كومر. Ideal Standard – Grohe – Duravit.');
  insertSection.run('قطاع الكهرباء', 'ABB – شنايدر – فينوس – اليوس – سانشي – شواب – كونيس وغيرها.');
  insertSection.run('قطاع الدهانات', 'سايبس – كابسي – إسكويب – جوتن. جميع أدوات وملحقات الدهان.');
  insertSection.run('قطاع التكييف', 'كباسات – فريونات – مواسير تكييف – شواحن وخراطيم.');
}

export default db;
