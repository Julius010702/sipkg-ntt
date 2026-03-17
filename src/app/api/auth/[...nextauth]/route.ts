import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { sekolah: true },
        })

        if (!user || user.statusAktif === 'NONAKTIF') return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.nama,
          role: user.role,
          avatar: user.avatar ?? null,
          sekolahId: user.sekolahId,
          namaSekolah: user.sekolah?.nama ?? null,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.avatar = (user as any).avatar
        token.sekolahId = (user as any).sekolahId
        token.namaSekolah = (user as any).namaSekolah
      }
      if (trigger === 'update') {
        if (session?.avatar !== undefined) token.avatar = session.avatar
        if (session?.name !== undefined) token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      ;(session.user as any).id = token.id
      ;(session.user as any).role = token.role
      ;(session.user as any).avatar = token.avatar ?? null
      ;(session.user as any).sekolahId = token.sekolahId
      ;(session.user as any).namaSekolah = token.namaSekolah
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }