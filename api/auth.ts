const REGISTERED_USERS: any[] = [
  {
    id: 'user-moshe',
    name: 'Moshe Ravi',
    email: 'moshe.ravikampadu@gmail.com',
    password: 'worship2026',
    churchName: 'Grace Community Church',
    role: 'Lead AV Director',
    accountSlug: 'mosheravikampadu',
    createdAt: 1710000000000,
  },
  {
    id: 'user-faith-church',
    name: 'Worship Leader',
    email: 'leader@church.org',
    password: 'password123',
    churchName: 'Faith Fellowship Church',
    role: 'Worship Director',
    accountSlug: 'faithchurch',
    createdAt: 1710000000000,
  },
];

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query?.action;

  if (action === 'register' && req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const churchName = String(body.churchName || `${name}'s Ministry`).trim();
    const role = String(body.role || 'Lead AV Director').trim();

    if (!name || !email || !email.includes('@') || password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a name, valid email, and password with at least 4 characters.',
        errorType: 'invalid_input',
      });
    }

    const existing = REGISTERED_USERS.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
        errorType: 'user_already_exists',
      });
    }

    const accountSlug = email.split('@')[0].replace(/[^a-z0-9_-]/g, '') || `account-${Date.now()}`;
    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      churchName,
      role,
      accountSlug,
      createdAt: Date.now(),
    };
    REGISTERED_USERS.push(user);

    return res.status(201).json({
      success: true,
      user,
      session: {
        churchName,
        accountName: accountSlug,
        operatorName: name,
        role,
        isLoggedIn: true,
        loginTime: Date.now(),
      },
    });
  }

  if (action === 'users' || req.url?.includes('/users')) {
    return res.status(200).json({
      success: true,
      users: REGISTERED_USERS.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        churchName: u.churchName,
        role: u.role,
        accountSlug: u.accountSlug,
        createdAt: u.createdAt,
        password: u.password,
      })),
    });
  }

  if (action === 'login' || req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;

    const user = REGISTERED_USERS.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `No registered account found for "${email}".`,
        errorType: 'user_not_found',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password entered.',
        errorType: 'wrong_password',
      });
    }

    const session = {
      churchName: user.churchName,
      accountName: user.accountSlug,
      operatorName: user.name,
      role: user.role,
      isLoggedIn: true,
      loginTime: Date.now(),
    };

    return res.status(200).json({
      success: true,
      user,
      session,
    });
  }

  return res.status(200).json({ success: true, message: 'Auth service active' });
}
