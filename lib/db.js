import { neon } from '@neondatabase/serverless';

let sql;
let sqlUnpooled;

export function getNeonClient(useUnpooled = false) {
  if (useUnpooled) {
    if (!sqlUnpooled) {
      const connectionString = process.env.NETLIFY_DATABASE_URL_UNPOOLED;
      if (!connectionString) {
        throw new Error('NETLIFY_DATABASE_URL_UNPOOLED não está definida');
      }
      sqlUnpooled = neon(connectionString);
    }
    return sqlUnpooled;
  }

  if (!sql) {
    const connectionString = process.env.NETLIFY_DATABASE_URL;
    if (!connectionString) {
      throw new Error('NETLIFY_DATABASE_URL não está definida');
    }
    sql = neon(connectionString);
  }
  return sql;
}

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  const sql = getNeonClient();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'instrutor', 'coordenador')),
      unit_id UUID,
      unit TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      address TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      schedule TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'justified')),
      justification TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, class_id, date)
    );
  `;
}
