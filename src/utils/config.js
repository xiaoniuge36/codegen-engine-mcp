import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 计算相对于 src/utils 的路径
export const ENGINE_ROOT = path.join(__dirname, '..', '..')
export const REPO_ROOT = path.join(ENGINE_ROOT, '..')
export const REGISTRY_PATH = path.join(ENGINE_ROOT, 'templates', 'template-registry.json')
export const KNOWLEDGE_DIR = path.join(ENGINE_ROOT, 'knowledge')
export const EXAMPLES_DIR = path.join(ENGINE_ROOT, 'templates', 'examples')
export const RULES_DIR = path.join(ENGINE_ROOT, 'rules')

export default {
  ENGINE_ROOT,
  REPO_ROOT,
  REGISTRY_PATH,
  KNOWLEDGE_DIR,
  EXAMPLES_DIR,
  RULES_DIR
}
