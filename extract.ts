import fs from 'fs';
import * as tar from 'tar';

try {
  tar.x({
    file: 'freecodecamp-curriculum-3.2.1.tgz',
    cwd: '.',
    sync: true,
    strip: 1
  });
  console.log('Extracted successfully!');
} catch (error) {
  console.error('Failed to extract', error);
}
