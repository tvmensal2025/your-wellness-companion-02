import { SupabaseClient } from '@supabase/supabase-js';
import { sofiaImageHandler } from '../handlers/sofiaImageHandler.js';
import { medicalExamHandler } from '../handlers/medicalExamHandler.js';
import { unifiedAssistantHandler } from '../handlers/unifiedAssistantHandler.js';
import { mealPlanHandler } from '../handlers/mealPlanHandler.js';
import { whatsappHandler } from '../handlers/whatsappHandler.js';
import { CacheManager } from './CacheManager.js';

interface Job {
  id: string;
  type: string;
  input: any;
  user_id: string;
}

export class JobProcessor {
  private supabase: SupabaseClient;
  private cache: CacheManager;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.cache = new CacheManager(supabase);
  }

  async process(job: Job): Promise<any> {
    console.log(`Processing job ${job.id} of type ${job.type}`);

    // Check cache first
    const cached = await this.cache.get(job.type, job.input);
    if (cached) {
      console.log(`✅ Cache hit for job ${job.id}`);
      return cached;
    }

    // Process based on type
    let result: any;

    switch (job.type) {
      case 'sofia_image':
        result = await sofiaImageHandler(job.input);
        break;

      case 'sofia_text':
        result = await sofiaImageHandler(job.input); // Same handler
        break;

      case 'medical_exam':
        result = await medicalExamHandler(job.input);
        break;

      case 'unified_assistant':
        result = await unifiedAssistantHandler(job.input);
        break;

      case 'meal_plan':
        result = await mealPlanHandler(job.input);
        break;

      case 'whatsapp_message':
        result = await whatsappHandler(job.input);
        break;

      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    // Cache result
    await this.cache.set(job.type, job.input, result);

    return result;
  }
}
