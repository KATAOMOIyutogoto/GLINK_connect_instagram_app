import Link from 'next/link';
import { listAccounts, type InstagramAccountView } from '@/lib/repo/instagramRepo';

export const dynamic = 'force-dynamic';

export default async function ConnectedPage() {
  let accounts: InstagramAccountView[];
  let error: string | null = null;

  try {
    accounts = await listAccounts();
  } catch (err) {
    console.error('Failed to load accounts:', err);
    error = 'アカウント一覧の読み込みに失敗しました';
    accounts = [];
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('ja-JP');
    } catch {
      return dateString;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-6xl w-full font-mono text-sm">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← ホームに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">
          接続済み Instagram アカウント
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              まだアカウントが接続されていません
            </p>
            <Link
              href="/connect"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Instagram を接続
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {accounts.length} 件のアカウントが接続されています
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Instagram User ID
                    </th>
                    <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ユーザー名
                    </th>
                    <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      接続日時
                    </th>
                    <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      トークン期限
                    </th>
                    <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      最終更新
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account.igUserId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {account.igUserId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {account.username || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(account.connectedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(account.tokenExpiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(account.lastRefreshedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <Link
                href="/connect"
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                別のアカウントを追加
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
