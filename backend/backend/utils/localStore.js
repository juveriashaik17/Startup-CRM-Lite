import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultLeads = [
  {
    _id: 'lead_1',
    name: 'Aarav Sharma',
    company: 'Tata Consultancy Services',
    email: 'aarav.sharma@tcs.com',
    phone: '+91 98765 43210',
    value: 245000,
    status: 'Won',
    source: 'LinkedIn',
    notes: 'Key decision maker for enterprise cloud migration contract.',
    owner: 'user_demo_1',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lead_2',
    name: 'Priya Patel',
    company: 'Infosys Technologies',
    email: 'priya.patel@infosys.com',
    phone: '+91 87654 32109',
    value: 182000,
    status: 'Won',
    source: 'Referral',
    notes: 'Expansion deal for 50 additional seats in Q3.',
    owner: 'user_demo_1',
    createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lead_3',
    name: 'Vikram Nair',
    company: 'Wipro Limited',
    email: 'vikram.nair@wipro.com',
    phone: '+91 91234 56780',
    value: 320000,
    status: 'Proposal Sent',
    source: 'Website',
    notes: 'Draft proposal submitted. Evaluation committee meeting scheduled.',
    owner: 'user_demo_1',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lead_4',
    name: 'Ananya Deshmukh',
    company: 'HCL Technologies',
    email: 'ananya.deshmukh@hcl.com',
    phone: '+91 99887 76655',
    value: 140000,
    status: 'Meeting Scheduled',
    source: 'LinkedIn',
    notes: 'Product demo scheduled for upcoming Tuesday.',
    owner: 'user_demo_1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lead_5',
    name: 'Rohan Mehta',
    company: 'Tech Mahindra',
    email: 'rohan.mehta@techmahindra.com',
    phone: '+91 97654 12345',
    value: 95000,
    status: 'Contacted',
    source: 'Cold Call',
    notes: 'Spoke with VP of Engineering. Requested detailed architecture deck.',
    owner: 'user_demo_1',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lead_6',
    name: 'Sneha Gupta',
    company: 'Zomato Media',
    email: 'sneha.gupta@zomato.com',
    phone: '+91 98111 22334',
    value: 210000,
    status: 'New',
    source: 'Website',
    notes: 'Signed up via inbound contact form inquiring about API access.',
    owner: 'user_demo_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'lead_7',
    name: 'Karan Malhotra',
    company: 'Bharti Airtel',
    email: 'karan.malhotra@airtel.com',
    phone: '+91 98100 99887',
    value: 115000,
    status: 'Lost',
    source: 'Cold Call',
    notes: 'Budget paused until next fiscal cycle.',
    owner: 'user_demo_1',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to initialize or read DB file
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        users: [
          {
            _id: 'user_demo_1',
            name: 'Demo Admin',
            email: 'demo@startupcrm.com',
            password: bcrypt.hashSync('Password123!', 10),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        leads: defaultLeads,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[LocalStore] Error reading db.json:', err);
    return { users: [], leads: defaultLeads };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[LocalStore] Error writing db.json:', err);
  }
}

export const localStore = {
  // Users
  findUserByEmail(email) {
    if (!email) return null;
    const db = readDB();
    const normalized = email.trim().toLowerCase();
    return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  findUserById(id) {
    if (!id) return null;
    const db = readDB();
    const user = db.users.find((u) => String(u._id) === String(id));
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ name, email, password }) {
    const db = readDB();
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'user_' + crypto.randomUUID().slice(0, 8),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Also copy sample leads for this new user so they immediately have data to explore!
    const userLeads = defaultLeads.map((l) => ({
      ...l,
      _id: 'lead_' + crypto.randomUUID().slice(0, 8),
      owner: newUser._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    db.leads.push(...userLeads);

    writeDB(db);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  },

  updateUser(id, updates) {
    const db = readDB();
    const idx = db.users.findIndex((u) => String(u._id) === String(id));
    if (idx === -1) return null;
    if (updates.name) db.users[idx].name = updates.name.trim();
    if (updates.password) {
      db.users[idx].password = bcrypt.hashSync(updates.password, 10);
    }
    db.users[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    const { password, ...safeUser } = db.users[idx];
    return safeUser;
  },

  // Leads
  getLeads(userId, query = {}) {
    const db = readDB();
    let userLeads = db.leads.filter((l) => String(l.owner) === String(userId));
    if (userLeads.length === 0) {
      // If no leads yet for user, show sample leads
      userLeads = db.leads;
    }

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      source,
      search,
    } = query;

    // Filter by status
    if (status && status !== 'All') {
      userLeads = userLeads.filter((l) => l.status === status);
    }

    // Filter by source
    if (source && source !== 'All') {
      userLeads = userLeads.filter((l) => l.source === source);
    }

    // Search
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      userLeads = userLeads.filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }

    // Sort
    userLeads.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    const total = userLeads.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const pages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginated = userLeads.slice(offset, offset + limitNum);

    return {
      data: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      pages,
      hasNext: pageNum < pages,
      hasPrev: pageNum > 1,
    };
  },

  getLeadById(id, userId) {
    const db = readDB();
    return db.leads.find((l) => String(l._id) === String(id)) || null;
  },

  createLead(data, userId) {
    const db = readDB();
    const newLead = {
      _id: 'lead_' + crypto.randomUUID().slice(0, 8),
      name: data.name?.trim(),
      company: data.company?.trim(),
      email: data.email?.trim().toLowerCase(),
      phone: data.phone?.trim() || '',
      value: Number(data.value) || 0,
      status: data.status || 'New',
      source: data.source || 'Website',
      notes: data.notes?.trim() || '',
      owner: String(userId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.leads.unshift(newLead);
    writeDB(db);
    return newLead;
  },

  updateLead(id, data, userId) {
    const db = readDB();
    const idx = db.leads.findIndex((l) => String(l._id) === String(id));
    if (idx === -1) return null;

    db.leads[idx] = {
      ...db.leads[idx],
      ...(data.name && { name: data.name.trim() }),
      ...(data.company && { company: data.company.trim() }),
      ...(data.email && { email: data.email.trim().toLowerCase() }),
      ...(data.phone !== undefined && { phone: data.phone.trim() }),
      ...(data.value !== undefined && { value: Number(data.value) }),
      ...(data.status && { status: data.status }),
      ...(data.source && { source: data.source }),
      ...(data.notes !== undefined && { notes: data.notes.trim() }),
      updatedAt: new Date().toISOString(),
    };
    writeDB(db);
    return db.leads[idx];
  },

  updateLeadStatus(id, status, userId) {
    const db = readDB();
    const idx = db.leads.findIndex((l) => String(l._id) === String(id));
    if (idx === -1) return null;

    db.leads[idx].status = status;
    db.leads[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    return db.leads[idx];
  },

  deleteLead(id, userId) {
    const db = readDB();
    const initialLen = db.leads.length;
    db.leads = db.leads.filter((l) => String(l._id) !== String(id));
    writeDB(db);
    return db.leads.length < initialLen;
  },

  getLeadStats(userId) {
    const db = readDB();
    let userLeads = db.leads.filter((l) => String(l.owner) === String(userId));
    if (userLeads.length === 0) userLeads = db.leads;

    const totalLeads = userLeads.length;
    const wonLeads = userLeads.filter((l) => l.status === 'Won').length;
    const lostLeads = userLeads.filter((l) => l.status === 'Lost').length;
    const pipelineValue = userLeads.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const wonValue = userLeads
      .filter((l) => l.status === 'Won')
      .reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;

    const stages = {
      New: userLeads.filter((l) => l.status === 'New').length,
      Contacted: userLeads.filter((l) => l.status === 'Contacted').length,
      'Meeting Scheduled': userLeads.filter((l) => l.status === 'Meeting Scheduled').length,
      'Proposal Sent': userLeads.filter((l) => l.status === 'Proposal Sent').length,
      Won: wonLeads,
      Lost: lostLeads,
    };

    return {
      totalLeads,
      wonLeads,
      lostLeads,
      pipelineValue,
      wonValue,
      conversionRate,
      stages,
    };
  },

  getMonthlyStats(userId) {
    const db = readDB();
    let userLeads = db.leads.filter((l) => String(l.owner) === String(userId));
    if (userLeads.length === 0) userLeads = db.leads;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, idx) => ({
      month: m,
      leads: Math.max(1, (userLeads.length % 5) + idx * 3),
      value: Math.max(50000, 100000 * (idx + 1)),
      won: Math.max(0, idx),
    }));
  },

  searchLeads(userId, keyword) {
    if (!keyword) return [];
    const db = readDB();
    const q = keyword.trim().toLowerCase();
    return db.leads
      .filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q))
      )
      .slice(0, 10);
  },
};

export default localStore;
