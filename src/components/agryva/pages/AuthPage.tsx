'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type User } from '@/components/agryva/store'
import { toast } from 'sonner'

const regions = [
  'Centre',
  'Littoral',
  'Ouest',
  'Nord-Ouest',
  'Sud-Ouest',
  'Sud',
  'Est',
  'Nord',
  'Extrême-Nord',
  'Adamaoua',
]

const roles = [
  { value: 'BUYER', label: 'Acheteur' },
  { value: 'SELLER', label: 'Vendeur' },
  { value: 'BOTH', label: 'Acheteur & Vendeur' },
]

interface AuthPageProps {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const { navigateTo, setUser } = useAppStore()

  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Register State
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regRegion, setRegRegion] = useState('')
  const [regRole, setRegRole] = useState('BOTH')
  const [regLoading, setRegLoading] = useState(false)
  const [regShowPassword, setRegShowPassword] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!loginEmail.trim()) newErrors.loginEmail = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail))
      newErrors.loginEmail = "L'email est invalide"
    if (!loginPassword) newErrors.loginPassword = 'Le mot de passe est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegister = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!regName.trim()) newErrors.regName = 'Le nom est requis'
    if (!regEmail.trim()) newErrors.regEmail = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail))
      newErrors.regEmail = "L'email est invalide"
    if (!regPassword) newErrors.regPassword = 'Le mot de passe est requis'
    else if (regPassword.length < 6)
      newErrors.regPassword = 'Le mot de passe doit contenir au moins 6 caractères'
    if (!regRegion) newErrors.regRegion = 'La région est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return

    setLoginLoading(true)
    try {
      const res = await fetch('/api/agryva/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const json = await res.json()

      if (json.success) {
        const user = json.data as User
        setUser(user)
        toast.success(`Bienvenue, ${user.name} !`)
        navigateTo('home')
      } else {
        toast.error(json.error || 'Erreur de connexion')
      }
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return

    setRegLoading(true)
    try {
      const res = await fetch('/api/agryva/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone || undefined,
          region: regRegion,
          role: regRole,
        }),
      })
      const json = await res.json()

      if (json.success) {
        const user = json.data as User
        setUser(user)
        toast.success('Compte créé avec succès !')
        navigateTo('home')
      } else {
        toast.error(json.error || "Erreur lors de l'inscription")
      }
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-emerald-600"
            onClick={() => navigateTo('home')}
          >
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'login'
              ? 'Accédez à votre compte agryva'
              : 'Rejoignez la communauté agricole n°1'}
          </p>
        </div>

        {mode === 'login' ? (
          /* ==================== LOGIN FORM ==================== */
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className={errors.loginEmail ? 'border-red-400' : ''}
                  />
                  {errors.loginEmail && (
                    <p className="text-xs text-red-500">{errors.loginEmail}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`pr-10 ${errors.loginPassword ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.loginPassword && (
                    <p className="text-xs text-red-500">
                      {errors.loginPassword}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                {/* Switch to register */}
                <p className="text-center text-sm text-gray-500">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => navigateTo('register')}
                    className="font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    S&apos;inscrire
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* ==================== REGISTER FORM ==================== */
          <Card>
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-lg">Inscription gratuite</CardTitle>
              <CardDescription>
                Créez votre compte en quelques secondes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nom complet</Label>
                  <Input
                    id="reg-name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jean Dupont"
                    className={errors.regName ? 'border-red-400' : ''}
                  />
                  {errors.regName && (
                    <p className="text-xs text-red-500">{errors.regName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className={errors.regEmail ? 'border-red-400' : ''}
                  />
                  {errors.regEmail && (
                    <p className="text-xs text-red-500">{errors.regEmail}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={regShowPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`pr-10 ${errors.regPassword ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {regShowPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.regPassword && (
                    <p className="text-xs text-red-500">{errors.regPassword}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">
                    Téléphone{' '}
                    <span className="text-xs font-normal text-gray-400">
                      (optionnel)
                    </span>
                  </Label>
                  <Input
                    id="reg-phone"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label>Région</Label>
                  <Select value={regRegion} onValueChange={setRegRegion}>
                    <SelectTrigger
                      className={`w-full ${errors.regRegion ? 'border-red-400' : ''}`}
                    >
                      <SelectValue placeholder="Sélectionnez votre région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.regRegion && (
                    <p className="text-xs text-red-500">{errors.regRegion}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label>Je suis</Label>
                  <Select value={regRole} onValueChange={setRegRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire gratuitement"
                  )}
                </Button>

                {/* Switch to login */}
                <p className="text-center text-sm text-gray-500">
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Se connecter
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
