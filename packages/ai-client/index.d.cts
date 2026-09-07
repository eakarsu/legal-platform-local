export class AIRequestError extends Error { code: string; status?: number; }
export function openRouterFetch(options: RequestInit & { timeoutMs?: number }, transport?: typeof fetch): Promise<Response>;
export function openRouterPost(body: unknown, config?: { headers?: HeadersInit; signal?: AbortSignal; timeout?: number }): Promise<{data: any; status: number}>;
export function createChatCompletion(body: { model: string; messages: unknown[]; [key: string]: unknown }): Promise<{id: string; model: string; choices: {message: {content: string | null}}[]; usage?: {prompt_tokens: number; completion_tokens: number; total_tokens: number}}>;
