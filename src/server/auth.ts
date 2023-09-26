import GithubProvider from '@auth/core/providers/github'
import { type SolidAuthConfig } from "@auth/solid-start"
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter'
import { fetchRedis } from './redis'
import { db } from './db'

export const authOptions: SolidAuthConfig = {
  adapter: UpstashRedisAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },
  providers: [
    GithubProvider({
      clientId: import.meta.env.GITHUB_ID as string,
      clientSecret: import.meta.env.GITHUB_SECRET as string,
    }),
  ],

  secret: import.meta.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      const dbUserResult = (await fetchRedis('get', `user:${token.sub}`)) as
        | string
        | null
      if (!dbUserResult) {
        if (user)
          token.id = user!.id

        return token
      }

      const dbUser = JSON.parse(dbUserResult) as User

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
    redirect() {
      return '/dashboard'
    },
  },
}
