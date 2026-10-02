import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TestPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any[] = []

    try {
      // Test 1: Query all profiles
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*')
      results.push({
        test: 'Query all profiles',
        success: !allError,
        count: allProfiles?.length || 0,
        error: allError?.message,
        data: allProfiles?.map(p => ({ id: p.id, role: p.role, email: p.email }))
      })

      // Test 2: Query image policies
      const { data: policies, error: policyError } = await supabase
        .from('image_policies')
        .select('*')
      results.push({
        test: 'Query image policies',
        success: !policyError,
        count: policies?.length || 0,
        error: policyError?.message,
        data: policies
      })

      // Test 3: Query audit logs
      const { data: logs, error: logError } = await supabase
        .from('role_audit_logs')
        .select('*')
      results.push({
        test: 'Query audit logs',
        success: !logError,
        count: logs?.length || 0,
        error: logError?.message,
        data: logs
      })

      // Test 4: Try to update own profile
      if (profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ bio: 'Test update' })
          .eq('id', profile.id)
        results.push({
          test: 'Update own profile',
          success: !updateError,
          error: updateError?.message
        })
      }

      setTestResults(results)
    } catch (error: any) {
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Security Test</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
          <CardHeader>
            <CardTitle>RLS Security Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>Current User:</strong> {user?.email}</p>
              <p><strong>Current Role:</strong> {profile?.role}</p>
            </div>
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running tests...' : 'Run Security Tests'}
            </Button>
          </CardContent>
        </Card>

        {testResults.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">
                {result.test}: {result.success ? '✅' : '❌'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Records returned:</strong> {result.count}</p>
              {result.error && (
                <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
              )}
              {result.data && (
                <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                  <pre className="text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  )
}
