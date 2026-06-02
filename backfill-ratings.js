import mongoose from "mongoose";
import dotenv from "dotenv";
import fileModel from "./models/files.model.js";

dotenv.config();

// Tasdiqlangan, lekin rating: null bo'lib qolgan fayllarni
// fileTitle ichidagi toifa nomi ("Oliy toifa", "I o'rin", ...) bo'yicha baholaydi.
// Standart holatda faqat KO'RSATADI (dry-run). Bazaga yozish uchun: node backfill-ratings.js --apply

const APPLY = process.argv.includes("--apply");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected\n");

  const docs = await fileModel.find({
    status: "Tasdiqlandi",
    "files.rating": null,
  });

  console.log(`Tekshiriladigan yozuvlar: ${docs.length}\n`);

  let updatedDocs = 0;
  let updatedFilesCount = 0;
  const unmatched = [];

  for (const doc of docs) {
    const tiers = Array.isArray(doc.achievments?.ratings)
      ? doc.achievments.ratings
      : [];

    let changed = false;
    const newFiles = doc.files.map((f) => {
      const plain = f.toObject();

      // allaqachon baholangan bo'lsa — tegmaymiz (qayta ishga tushirishga xavfsiz)
      if (plain.rating && plain.rating.rating != null) return plain;

      // sarlavhada uchragan toifalardan eng uzunini (eng aniqini) tanlaymiz
      const candidates = tiers
        .filter((t) => t?.about && plain.fileTitle?.includes(t.about))
        .sort((a, b) => b.about.length - a.about.length);
      const match = candidates[0];

      if (!match) {
        unmatched.push({
          fileId: doc._id.toString(),
          fileTitle: plain.fileTitle,
          tiers: tiers.map((t) => t.about),
        });
        return plain;
      }

      changed = true;
      updatedFilesCount += 1;
      console.log(
        `  ✓ "${plain.fileTitle}"  →  ${match.rating} ball (${match.about})`
      );
      return {
        ...plain,
        rating: { about: match.about, rating: match.rating },
      };
    });

    if (changed) {
      updatedDocs += 1;
      if (APPLY) {
        await fileModel.updateOne(
          { _id: doc._id },
          { $set: { files: newFiles } }
        );
      }
    }
  }

  console.log(
    `\n${APPLY ? "Yangilandi" : "[DRY-RUN] Yangilanadi"}: ${updatedDocs} ta yozuv, ${updatedFilesCount} ta fayl`
  );

  if (unmatched.length) {
    console.log(
      `\n⚠️  Sarlavhadan toifa topilmagan ${unmatched.length} ta fayl (qo'lda ko'rib chiqing):`
    );
    unmatched.forEach((u) =>
      console.log(`  - [${u.fileId}] "${u.fileTitle}"  | mavjud toifalar: ${u.tiers.join(", ")}`)
    );
  }

  if (!APPLY) {
    console.log(
      "\nBazaga yozish uchun qayta ishga tushiring:  node backfill-ratings.js --apply"
    );
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
