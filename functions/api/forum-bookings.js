export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const required = ['name', 'phone', 'date', 'start', 'duration', 'type'];
    for (const key of required) {
      if (!body?.[key] || String(body[key]).trim() === '') {
        return Response.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const db = env.DB;
    if (!db) return Response.json({ error: 'Database binding DB is not configured.' }, { status: 500 });

    await db.prepare(`CREATE TABLE IF NOT EXISTS forum_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      people INTEGER,
      booking_type TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();

    const people = body.people ? Number(body.people) : null;
    if (people !== null && (!Number.isInteger(people) || people < 1 || people > 100)) {
      return Response.json({ error: 'Invalid number of people.' }, { status: 400 });
    }

    const conflict = await db.prepare(`SELECT booking_id FROM forum_bookings
      WHERE booking_date = ? AND start_time = ? AND status IN ('pending','confirmed') LIMIT 1`)
      .bind(body.date, body.start).first();
    if (conflict) {
      return Response.json({ error: 'هذا الوقت محجوز أو قيد المراجعة. يرجى اختيار وقت آخر.' }, { status: 409 });
    }

    const bookingId = `FORUM-${Date.now().toString().slice(-8)}`;
    await db.prepare(`INSERT INTO forum_bookings
      (booking_id,name,phone,email,booking_date,start_time,duration,people,booking_type,details)
      VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(bookingId, String(body.name).trim(), String(body.phone).trim(), body.email ? String(body.email).trim() : null,
        body.date, body.start, body.duration, people, String(body.type).trim(), body.details ? String(body.details).trim() : null)
      .run();

    return Response.json({ ok: true, booking_id: bookingId }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Unable to process booking.' }, { status: 500 });
  }
}
