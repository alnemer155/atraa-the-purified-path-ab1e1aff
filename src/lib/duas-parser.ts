// Parse the duas content file into structured sections
export interface DuaItem {
  id: string;
  title: string;
  content: string;
  category: 'dua' | 'ziyara' | 'dhikr';
}

export function parseDuasContent(text: string): DuaItem[] {
  const items: DuaItem[] = [];
  const lines = text.split('\n');
  
  let currentTitle = '';
  let currentContent = '';
  let currentCategory: 'dua' | 'ziyara' | 'dhikr' = 'dua';
  let inItem = false;
  let id = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect category markers
    if (line.includes('الادعية ⬇️')) {
      currentCategory = 'dua';
      continue;
    }
    if (line.includes('الزيارات ⬇️') || line.includes('•••• الزيارات')) {
      currentCategory = 'ziyara';
      continue;
    }
    if (line.includes('الأذكار ⬇️') || line.includes('•••• الأذكار')) {
      currentCategory = 'dhikr';
      continue;
    }

    // Detect title lines starting with ••
    if (line.startsWith('••') && !line.startsWith('••••')) {
      // Save previous item
      if (inItem && currentTitle && currentContent.trim()) {
        items.push({
          id: `item-${id++}`,
          title: currentTitle,
          content: currentContent.trim(),
          category: currentCategory,
        });
      }
      
      currentTitle = line.replace(/^••\s*/, '').trim();
      currentContent = '';
      inItem = true;
      continue;
    }

    // Also detect "مناجاة" titles
    if (line.startsWith('مناجاة')) {
      if (inItem && currentTitle && currentContent.trim()) {
        items.push({
          id: `item-${id++}`,
          title: currentTitle,
          content: currentContent.trim(),
          category: 'dhikr',
        });
      }
      currentTitle = line;
      currentContent = '';
      currentCategory = 'dhikr';
      inItem = true;
      continue;
    }

    // Skip metadata lines
    if (line.startsWith('المصدر') || line.startsWith('المرجع') || line === '••' || line.startsWith('____')) {
      continue;
    }

    if (inItem && line) {
      currentContent += line + '\n';
    }
  }

  // Push last item
  if (inItem && currentTitle && currentContent.trim()) {
    items.push({
      id: `item-${id++}`,
      title: currentTitle,
      content: currentContent.trim(),
      category: currentCategory,
    });
  }

  return items;
}
