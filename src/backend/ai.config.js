// AI Configuration File
// このファイルでAIの動作を設定します

export const AI_CONFIG = {
  // AIモデル
  // 利用可能: gpt-4o-realtime-preview-2024-12-17, gpt-realtime
  model: 'gpt-realtime',
  
  // 音声の種類
  // 利用可能: alloy, echo, fable, onyx, nova, shimmer
  // - alloy: 中性的でバランスの取れた声
  // - echo: 男性的で落ち着いた声
  // - fable: 女性的で温かみのある声
  // - onyx: 深みのある男性的な声
  // - nova: 明るく活発な女性的な声
  // - shimmer: やさしく柔らかい女性的な声
  voice: 'fable',
  
  // ロールキーワード
  // .envで設定されている場合、LLMがこのキーワードからロールを生成します
  // 例: "本", "先生", "友達", "執事" など
  roleKeyword: process.env.ROLE_KEYWORD || null,
  
  // 基本システムプロンプト（ロールが生成されない場合のデフォルト）
  baseSystemPrompt: `# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2-3 sentences per turn.

## Language
- The conversation will be only in Japanese.
- Do not respond in any other language even if the user asks.
- If the user speaks another language, politely explain that support is limited to Japanese.`,

  // システムプロンプト（動的に生成される）
  systemPrompt: null  // 起動時にserver.jsで設定される
};
