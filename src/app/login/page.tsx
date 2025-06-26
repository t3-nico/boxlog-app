import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-medium">Email:</label>
        <input id="email" name="email" type="email" required className="w-full border px-3 py-2 rounded" />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block mb-1 font-medium">Password:</label>
        <input id="password" name="password" type="password" required className="w-full border px-3 py-2 rounded" />
      </div>
      <div className="flex gap-4">
        <button formAction={login} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Log in</button>
        <button formAction={signup} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition">Sign up</button>
      </div>
    </form>
  )
} 