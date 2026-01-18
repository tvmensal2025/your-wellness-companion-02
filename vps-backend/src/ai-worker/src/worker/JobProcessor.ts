import { SupabaseClient } from '@supabase/supabase-js';
import { sofiaImageHandler } from '../handlers/sofiaImageHandler.js';
import { medicalExamHandler } from '../handlers/medicalExamHandler.js';
import { unifiedAssistantHandler } from '../handlers/unifiedAssistantHandler.js';
import { mealPlanHandler } from '../handlers/mealPlanHandler.js';
import { whatsappHandler } from '../handlers/whatsappHandler.js';
import { CacheManager } from './CacheManager.js';

interface Job {
  id: string;
  job_type: string;  // Lovable uses 'job_type' column
  input_data: any;   // Lovable uses 'input_data' column
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
    console.log(`Processing job ${job.id} of type ${job.job_type}`);

    // Check cache first
    const cached = await this.cache.get(job.job_type, job.input_data);
    if (cached) {
      console.log(`✅ Cache hit for job ${job.id}`);
      return cached;
    }

    // Process based on type
    let result: any;

    switch (job.job_type) {
      case 'sofia_image':
        result = await sofiaImageHandler(job.input_data);
        break;

      case 'sofia_text':
        result = await sofiaImageHandler(job.input_data); // Same handler
        break;

      case 'medical_exam':
        result = await medicalExamHandler(job.input_data);
        break;

      case 'unified_assistant':
        result = await unifiedAssistantHandler(job.input_data);
        break;

      case 'meal_plan':
        result = await mealPlanHandler(job.input_data);
        break;

      case 'whatsapp_message':
        result = await whatsappHandler(job.input_data);
        break;

      default:
        throw new Error(`Unknown job type: ${job.job_type}`);
    }

    // Cache result
    await this.cache.set(job.job_type, job.input_data, result);

    return result;
  }
}
