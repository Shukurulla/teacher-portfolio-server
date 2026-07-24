import mongoose from "mongoose";
import fileModel from "./models/files.model.js";
import jobModel from "./models/job.model.js";
import dotenv from "dotenv";

dotenv.config();

async function cleanupOrphanAchievements() {
  try {
    // MongoDB ga ulanish
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected\n");
    
    console.log("Starting cleanup...");

    // Barcha achievementlarni olish
    const allFiles = await fileModel.find();
    console.log(`Total achievements: ${allFiles.length}`);

    // Barcha job ID larini olish
    const allJobs = await jobModel.find();
    const validJobIds = new Set(allJobs.map((job) => job._id.toString()));
    console.log(`Valid jobs: ${validJobIds.size}`);

    // Orphan achievementlarni topish
    const orphanFiles = [];
    for (const file of allFiles) {
      if (file.from?.job && !validJobIds.has(file.from.job.toString())) {
        orphanFiles.push(file);
      }
    }

    console.log(`Found ${orphanFiles.length} orphan achievements`);

    if (orphanFiles.length > 0) {
      console.log("\nOrphan achievements:");
      orphanFiles.forEach((file) => {
        console.log(
          `- Achievement ID: ${file._id}, Job ID: ${file.from.job}, Teacher: ${file.from.firstName} ${file.from.lastName}`,
        );
      });

      console.log("\nDeleting orphan achievements...");
      for (const file of orphanFiles) {
        await fileModel.findByIdAndDelete(file._id);
        console.log(`Deleted achievement ${file._id}`);
      }
      console.log(`\n✅ Cleanup complete! Deleted ${orphanFiles.length} orphan achievements.`);
    } else {
      console.log("\n✅ No orphan achievements found. Database is clean!");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupOrphanAchievements();
