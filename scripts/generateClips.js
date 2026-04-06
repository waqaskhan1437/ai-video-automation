const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ZSKY_API_URL = 'https://zsky.ai/api/v1/video/generate';
const CLIP_DURATION = 10;
const NUM_CLIPS = parseInt(process.argv[3]) || 6;

const prompts = [
  "A serene mountain landscape at sunrise with golden light",
  "Ocean waves crashing on a rocky coastline at sunset",
  "A bustling city street with people walking and cars passing",
  "Forest pathway covered in autumn leaves with sunlight filtering through",
  "A cozy coffee shop interior with steam rising from cups",
  "Stars twinkling in a clear night sky with Milky Way visible",
  "Rain falling on a window with city lights in the background",
  "A garden full of colorful flowers blooming in spring",
  "Snow falling gently over a peaceful village",
  "A rocket launching into space with smoke trail",
  "Northern lights dancing across the Arctic sky",
  "A waterfall cascading down mossy rocks in tropical forest",
  "Hot air balloons floating over a scenic valley at dawn",
  "A butterfly landing on a flower in a sunny meadow",
  "Lightning storm over a dark prairie landscape"
];

const randomPrompts = [
  "Time-lapse of a blooming flower from bud to full bloom",
  "Aerial view of a tropical island from above",
  "Underwater scene with colorful coral reef and fish",
  "A train traveling through snowy mountains",
  "Cherry blossom petals falling in slow motion",
  "A campfire night scene with stars in the sky",
  "City skyline at night with traffic light trails",
  "A waterfall in the rainforest with sunbeams",
  "Desert dunes with wind blowing sand",
  "A cat playing with yarn in a cozy room"
];

function getRandomPrompts(count) {
  const shuffled = [...randomPrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getClipPrompts(originalPrompt, count) {
  if (originalPrompt && originalPrompt.trim() !== '') {
    return Array(count).fill(originalPrompt);
  }
  return getRandomPrompts(count);
}

async function generateClip(prompt, index) {
  console.log(`Generating clip ${index + 1}: ${prompt.substring(0, 50)}...`);
  
  try {
    const response = await axios.post(ZSKY_API_URL, {
      prompt: prompt,
      duration: CLIP_DURATION,
      resolution: '1080p',
      audio: true,
      style: 'cinematic'
    }, {
      responseType: 'arraybuffer',
      timeout: 120000
    });
    
    const filename = `clip_${String(index + 1).padStart(2, '0')}.mp4`;
    const filepath = path.join('clips', filename);
    
    if (!fs.existsSync('clips')) {
      fs.mkdirSync('clips', { recursive: true });
    }
    
    fs.writeFileSync(filepath, Buffer.from(response.data));
    
    console.log(`✓ Clip ${index + 1} saved: ${filename} (${(response.data.length / 1024 / 1024).toFixed(2)} MB)`);
    
    return {
      index: index + 1,
      prompt: prompt,
      filename: filename,
      size: response.data.length
    };
    
  } catch (error) {
    console.error(`✗ Failed to generate clip ${index + 1}:`, error.message);
    throw error;
  }
}

async function generateClips() {
  const originalPrompt = process.argv[2] || '';
  const clipPrompts = getClipPrompts(originalPrompt, NUM_CLIPS);
  
  console.log('\n🎬 AI Video Generation Pipeline');
  console.log('='.repeat(40));
  console.log(`Prompt: ${originalPrompt || '(Random)'}`);
  console.log(`Clips: ${NUM_CLIPS} × ${CLIP_DURATION}s = ${NUM_CLIPS * CLIP_DURATION}s total`);
  console.log('='.repeat(40) + '\n');
  
  const clips = [];
  
  for (let i = 0; i < NUM_CLIPS; i++) {
    const clip = await generateClip(clipPrompts[i], i);
    clips.push(clip);
    
    if (i < NUM_CLIPS - 1) {
      console.log('Waiting 3 seconds before next clip...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  fs.writeFileSync('clips.json', JSON.stringify(clips, null, 2));
  
  const totalSize = clips.reduce((sum, c) => sum + c.size, 0);
  console.log('\n' + '='.repeat(40));
  console.log(`✓ All ${NUM_CLIPS} clips generated!`);
  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(40));
  
  return clips;
}

generateClips().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
