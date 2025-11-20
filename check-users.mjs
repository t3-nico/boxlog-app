import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
})

try {
  await client.connect()
  console.log('✅ Connected to database\n')

  // auth.users を確認
  console.log('=== auth.users ===')
  const usersResult = await client.query(`
    SELECT id, email, created_at, email_confirmed_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10;
  `)

  if (usersResult.rows.length > 0) {
    console.log(`Found ${usersResult.rows.length} users:`)
    console.table(usersResult.rows)
  } else {
    console.log('❌ No users found in auth.users')
  }

  // public.profiles を確認
  console.log('\n=== public.profiles ===')
  const profilesResult = await client.query(`
    SELECT id, email, username, created_at
    FROM public.profiles
    ORDER BY created_at DESC
    LIMIT 10;
  `)

  if (profilesResult.rows.length > 0) {
    console.log(`Found ${profilesResult.rows.length} profiles:`)
    console.table(profilesResult.rows)
  } else {
    console.log('❌ No profiles found in public.profiles')
  }

  // notification_preferences を確認
  console.log('\n=== public.notification_preferences ===')
  const prefsResult = await client.query(`
    SELECT user_id, enable_browser_notifications, created_at
    FROM public.notification_preferences
    ORDER BY created_at DESC
    LIMIT 10;
  `)

  if (prefsResult.rows.length > 0) {
    console.log(`Found ${prefsResult.rows.length} notification preferences:`)
    console.table(prefsResult.rows)
  } else {
    console.log('❌ No notification preferences found')
  }

} catch (err) {
  console.error('❌ Error:', err.message)
} finally {
  await client.end()
}
