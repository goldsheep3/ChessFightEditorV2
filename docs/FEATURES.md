# Features Documentation

## Theme Switching

### Overview
The ChessFight Editor now supports dynamic theme switching with a YAML-based configuration system.

### Usage
1. Click the 🎨 button in the top-right corner of the application
2. Select a theme from the dropdown menu
3. Your choice is saved to localStorage and will persist across sessions

### Available Themes
- **默认主题 (Default Theme)**: Purple-blue gradient with light backgrounds
- **暗色主题 (Dark Theme)**: Dark backgrounds with purple accents

### Adding New Themes
1. Create a new YAML file in `frontend/src/themes/` (e.g., `ocean.yaml`)
2. Follow the structure in `default.yaml`:
```yaml
name: "Ocean Theme"
description: "Ocean-inspired color scheme"

primary:
  main: "#0ea5e9"
  light: "#38bdf8"
  dark: "#0284c7"
  gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"

# ... other color categories
```
3. Import the theme in `frontend/src/utils/theme.js`:
```javascript
import oceanThemeYaml from '../themes/ocean.yaml?raw'

const themeFiles = {
  'default': defaultThemeYaml,
  'dark': darkThemeYaml,
  'ocean': oceanThemeYaml  // Add here
}

const availableThemes = [
  { id: 'default', name: '默认主题' },
  { id: 'dark', name: '暗色主题' },
  { id: 'ocean', name: '海洋主题' }  // Add here
]
```

### Theme Structure
Themes define colors in the following categories:
- **primary**: Main application colors
- **secondary**: Action colors (blue, green, red)
- **text**: Text colors for different contexts
- **background**: Background colors
- **border**: Border colors
- **rarity**: Card rarity badge colors (SSR, SR, R, N)
- **status**: Status message colors (success, warning, error, info)
- **button**: Button colors
- **special**: Special effect colors

## Internationalization (i18n)

### Overview
The application now uses a YAML-based i18n system for managing translations.

### Usage in Components
```vue
<script setup>
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()
</script>

<template>
  <button>{{ t('btn.save') }}</button>
  <h2>{{ t('heading.basic_info') }}</h2>
</template>
```

### Translation Keys
Translations are organized hierarchically in `frontend/src/locales/zh-CN.yaml`:
- `app.*`: Application-level text
- `common.*`: Common terms (save, cancel, etc.)
- `nav.*`: Navigation items
- `btn.*`: Button labels
- `form.*`: Form field labels
- `heading.*`: Section headings
- `alignment.*`: Effect alignment types
- `rarity.*`: Card rarity labels
- `hint.*`: Placeholder and hint text
- `validation.*`: Validation error messages
- `success.*`: Success messages
- `error.*`: Error messages
- `empty.*`: Empty state messages
- `stats.*`: Statistics labels
- `modal.*`: Modal dialog titles
- `help.*`: Help text

### Adding New Translations
1. Add the translation to `frontend/src/locales/zh-CN.yaml`:
```yaml
form:
  new_field: 新字段名称
```
2. Use it in your component:
```vue
<label>{{ t('form.new_field') }}</label>
```

### Adding New Locales
1. Create a new YAML file (e.g., `en-US.yaml`) following the structure of `zh-CN.yaml`
2. Import it in `frontend/src/utils/i18n.js`:
```javascript
import enUSYaml from '../locales/en-US.yaml?raw'

const localeFiles = {
  'zh-CN': zhCNYaml,
  'en-US': enUSYaml  // Add here
}
```
3. Add locale switching UI if needed

## Attack Card Fields

### atk_delta Field
Attack cards now properly include the `atk_delta` field which represents the attack power change.

**Example**:
```json
{
  "id": "fireball",
  "name": "火球术",
  "cost": 3,
  "atk_delta": 5,
  "rarity": "SR",
  "text": "对目标造成5点伤害"
}
```

### Validation
- `atk_delta` is required for all attack cards
- Can be positive (damage) or negative (debuff)
- Must be an integer value

## Development

### Building
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

### Dependencies
- `js-yaml`: YAML parsing for themes and i18n
