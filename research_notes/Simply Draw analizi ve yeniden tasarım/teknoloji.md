# Technology Behind Simply Draw and State of the Art for AI-Assisted Drawing-Learning Apps (as of Sept 2026)

Research date: 2026-09-28. Labels used below: **[CONFIRMED]** means stated by Simply or an official store listing. **[REPORTED]** means a third party or user said it. **[INFERENCE]** is my own reasoning. **[UNVERIFIED BACKGROUND]** is general technical knowledge I did not re-check with a source in this session; the report writer should verify it or soften it before stating it as fact.

---

## 1. How does Simply Draw work technically? (Recognition, CV, AR, or video + self-assessment?)

### Takeaway
Simply Draw is a pencil-on-paper course built around video tutorials. Its public materials claim "real-time visual AI-feedback on actual drawings" and an "AI-driven personalized learning path." The only technical statement from a Simply employee is vague: "neural networks machine learning." User reviews suggest the feedback works by photographing the finished drawing with the camera. They do not describe live stroke-tracking or AR. Some users say the promised AI feedback does not appear. I found no Simply patent, engineering blog post or job listing about drawing or computer vision. Simply's known deep tech is its audio engine, MusicSense, and I found no drawing equivalent of it.

### Cited Findings
- Simply Draw launched in 2023. It is a subscription app for iOS and Android that teaches pencil drawing on paper. It offers "step-by-step video tutorials, real-time visual AI-feedback on actual drawings, and an AI-driven personalized learning path," with a separate path for younger children — [Wikipedia: Simply (software company)](https://en.wikipedia.org/wiki/Simply_(software_company)). Wikipedia cites hellosimply.com and a Product Hunt post dated 2024-07-30.
- JoyTunes rebranded to Simply in July 2022 "to better reflect its broader focus on creative hobbies, including drawing" — [Wikipedia](https://en.wikipedia.org/wiki/JoyTunes).
- **[CONFIRMED]** The App Store description says: "Learn and practice drawing beautiful pencil drawings on paper… Draw along with easy-to-follow video tutorials made by professional artists and teachers… New drawing sessions added weekly." The listing I fetched did not mention AI feedback — [App Store listing](https://apps.apple.com/us/app/simply-draw-learn-to-draw/id1639875485).
- **[CONFIRMED]** The App Store privacy label lists **User Content (Photos/Videos)** as "Data Linked to You." It also lists Identifiers as "Data Used to Track You." The age rating is 4+ — [App Store listing](https://apps.apple.com/us/app/simply-draw-learn-to-draw/id1639875485). The page returned "4.7 (785K ratings)." That number looks high for Simply Draw and may be a scrape artifact, so it needs checking.
- **[CONFIRMED]** The official product page (hellosimply.com/simply-draw) talks about step-by-step breakdowns, shading and creative expression. It says nothing about AI feedback, camera, AR or stylus features — [hellosimply.com/simply-draw](https://www.hellosimply.com/simply-draw).
- **[CONFIRMED, vague]** Simply Draw's Product Hunt launch (tagline "AI feedback meets art - anyone can learn to draw," launched 2024-07-31) has one maker comment on the tech, from Tomer Harry (Simply): "For the AI feedback we are leveraging neural networks machine learning. For Gen AI we mainly thinking how to help users get inspired…" — [Product Hunt](https://www.producthunt.com/posts/simply-draw). The same tagline appears in a LinkedIn post by Tali Fulman — [LinkedIn](https://www.linkedin.com/posts/tali-fulman_simply-draw-ai-feedback-meets-art-anyone-activity-7224485569165185027-Kyn6).
- **[REPORTED – users]** The App Store reviews are mixed on AI feedback. One says "It doesn't actually give me the AI feedback advertised." Another says "AI will tell you what you need to work on." A third says "I went and took a picture of my drawing and saved it to the journal on the app" — [App Store listing](https://apps.apple.com/us/app/simply-draw-learn-to-draw/id1639875485).
- **[REPORTED – users]** One user wrote: "I could not move on after the sailboat lesson, because I had to take a picture of my work." The same user asked to be allowed to import from the camera roll instead of being forced to use the camera. Another review says "It gives you support and feedback with ai!" — [JustUseApp review aggregate](https://justuseapp.com/en/app/1639875485/simply-draw-learn-to-draw/reviews).
- **[REPORTED]** A review aggregator says Simply Draw launched with one course in 2023 and had two courses in 2024 — [search summary of Research.com review](https://research.com/software/reviews/simplydraw-review). This is secondary and I did not open the page.
- Simply's known proprietary tech is **MusicSense**, a patented note-recognition engine that "supports acoustic instruments." Simply Guitar and Simply Sing advertise "real-time AI-feedback" on audio — [Wikipedia](https://en.wikipedia.org/wiki/Simply_(software_company)).
- The Simply patents I found on Google Patents are all about music, for example US20240054911A2, "Crowd-based device configuration selection of a music teaching system." It was published 2024-02-15 and reassigned to Simply Ltd in November 2024 — [Google Patents](https://patents.google.com/patent/US20240054911A2/en). Another example is WO2011030225A3, "System and method for improving musical education" — [Google Patents](https://patents.google.com/patent/WO2011030225A3/en). A Crunchbase summary says Simply has 3 registered patents, mainly in "Musical Instruments; Acoustics" — [Crunchbase](https://www.crunchbase.com/organization/joytunes/technology). I found none about drawing or images.
- Simply's careers page describes a "startup-within-a-startup pod structure." Searching for Simply computer-vision or ML job listings found nothing specific — [Simply careers](https://www.hellosimply.com/careers); [Glassdoor CV jobs search](https://www.glassdoor.com/Job/israel-computer-vision-jobs-SRCH_IL.0,6_IN119_KO7,22.htm).
- Simply is putting money into XR for music. Simply Piano came to Apple Vision Pro in December 2024 and to Android XR / Galaxy XR in 2025. I found no XR or AR version of Simply Draw — [Wikipedia](https://en.wikipedia.org/wiki/Simply_(software_company)).

### Inferences
- **[INFERENCE]** The most likely design is this: the app plays a video lesson, the user draws on paper, then photographs the result, and at some checkpoints the photo is required. A server-side or on-device image model then either (a) checks that a drawing is present and roughly matches the lesson, or (b) produces short tips. Nothing suggests live pen tracking, on-screen stroke analysis or AR projection. The phrase "real-time visual AI-feedback" most likely means feedback arrives right after the photo, not while the user is drawing.
- **[INFERENCE]** Because some users say they never saw AI feedback, the feature may be limited to some lessons, gated behind the paywall, A/B-tested, or weak in practice. The drawing side of Simply has no equivalent of MusicSense, where real-time listening is the core of the product.
- **[INFERENCE]** The maker's 2024 comment pairs "neural networks" for feedback with GenAI only for "inspiration." That suggests they used a trained classifier or similarity model, not an LLM or VLM critique, at least at launch. This may have changed by 2026.
- **[INFERENCE]** A photo of paper is a much weaker signal than audio. It is a single snapshot and has no process data such as stroke order, speed or pressure. This probably explains why Simply's drawing feedback is shallow compared with its music feedback. A new app can stand out by capturing process data, through a digital canvas or a camera time-lapse.

### Gaps
- I found no Simply engineering blog, conference talk, patent or job posting that describes the drawing-feedback pipeline (model type, on-device vs. cloud, what it scores).
- I found no founder interview (Yuval Kaminka, Chen Lamdan) in this session that discusses Simply Draw's tech.
- It is unclear whether current versions (2025–2026) added VLM or LLM critique, AR, or a digital-canvas mode. A hands-on test of the app is recommended.
- The 785K App Store rating count needs checking.

---

## 2. State of the art in evaluating drawings (stroke recognition, similarity, VLM critique)

### Takeaway
There are two technical approaches. (a) **Vector/stroke-based evaluation** needs a digital canvas. It is mature, fast and deterministic, and ArtWorkout uses it to score strokes in real time. (b) **Image-based evaluation** of paper drawings works through photos. In 2025–2026 this increasingly means multimodal LLMs (VLMs). Their feedback is useful but noisy. On a children's-art benchmark, fine-tuned open VLMs reached roughly human inter-rater agreement on average, but did poorly on abstract dimensions such as line quality.

### Cited Findings
- **Quick, Draw! dataset:** 50 million drawings in 345 categories. Each drawing is stored as timestamped stroke vectors (x, y and time in ms). It is licensed CC BY 4.0. It includes Sketch-RNN training sets with 75K samples per category (70K train, 2.5K validation, 2.5K test), simplified with Ramer-Douglas-Peucker (ε=2.0), plus 28×28 bitmaps — [googlecreativelab/quickdraw-dataset](https://github.com/googlecreativelab/quickdraw-dataset).
- **Real-time stroke scoring in production:** ArtWorkout scores "accuracy as users trace and shape lines on the screen." It looks at steadiness, cleanliness and expressiveness. In fill exercises "you're scored on how completely you fill them and how far you go outside the lines" — [ArtWorkout App Store](https://apps.apple.com/us/app/artworkout-learn-how-to-draw/id1564657118); [MWM ArtWorkout page](https://mwm.ai/apps/artworkout-learn-how-to-draw/1564657118). This summary came from search snippets. Entrepreneur says ArtWorkout has reached "75 million people" — [Entrepreneur UK](https://uk.entrepreneur.com/technology/the-story-behind-artworkout-the-app-helping-75-million/501441).
- **VLM critique of children's art (KidsArtBench, arXiv 2512.12503, Dec 2025):** 1,046 artworks by children aged 5–15, scored on 9 rubric dimensions (Realism, Deformation, Imagination, Color Richness, Color Contrast, Line Combination, Line Texture, Picture Organization, Transformation). Prompted Qwen2.5-VL baseline: Spearman 0.468, QWK 0.338. Qwen2.5-VL-7B fine-tuned with multi-LoRA and RAFT: Spearman 0.648, QWK 0.566. Human inter-rater agreement: Spearman 0.629, QWK 0.567. Line Combination "rarely exceeds SC = 0.28" when models are only prompted. The authors say MLLMs "struggle with evaluative dimensions that require abstraction, compositional reasoning, or creative interpretation." They tested only open-source models, not GPT, Gemini or Claude — [KidsArtBench](https://arxiv.org/html/2512.12503).
- Related benchmarks: cross-cultural expert-level art critique by VLMs — [arXiv 2601.07984](https://arxiv.org/pdf/2601.07984). DrawEduMath reports that "VLMs underperform with struggling students and misdiagnose errors" on hand-drawn math responses — [arXiv 2603.00925](https://arxiv.org/pdf/2603.00925); [DrawEduMath NAACL 2025](https://aclanthology.org/2025.naacl-long.352.pdf). SketchVLM (2026) has VLMs draw annotations on the image to explain and guide users, which fits "redline" drawing feedback — [arXiv 2604.22875](https://arxiv.org/pdf/2604.22875).
- Commercial apps using photo-based AI critique in 2026: **Coartist: AI Art Feedback**. It gives feedback on artwork, turns it into personalized plans and daily drills, and has an "AI Mentor" that adjusts the plan, with the user approving each change — [Coartist Google Play (search snippet)](https://play.google.com/store/apps/details?id=com.artistscompany.coartist&hl=en_US). **Vangu: Learn to Draw**: "snap a photo of your sketch and let AI tell you exactly what to work on next" — [Vangu Google Play (search snippet)](https://play.google.com/store/apps/details?id=com.jaixy.learn_to_draw).

### Inferences
- **[INFERENCE]** A layered design is the best fit. Use deterministic geometric checks for measurable things: proportions, alignment against the lesson's reference, line closure, and stroke steadiness from a digital canvas or a rectified photo. Use a VLM only for qualitative coaching in natural language. Do not let a VLM hand out scores.
- **[INFERENCE]** For paper drawings, the pipeline would be: detect the page corners, apply a perspective warp, normalize contrast, binarize or extract lines, then register the result against the lesson reference with keypoint or affine alignment. That allows overlay "diff" feedback, such as "the ear is 15% too low," which VLMs alone cannot measure reliably.
- **[INFERENCE]** Latency: rule-based checks run on-device in milliseconds. A cloud VLM round-trip usually takes a few seconds. That is fine for end-of-step feedback but not for live stroke feedback. **[UNVERIFIED BACKGROUND]**: Typical frontier VLM response time for an image plus a short critique is about 2–10 s, depending on the model and output length.
- **[INFERENCE]** For kids, the KidsArtBench numbers suggest VLM scores should be encouraging and non-numeric. Model agreement with humans on line and color dimensions is low.

### Gaps
- I found no published benchmark of GPT, Gemini or Claude as drawing tutors for adult beginners, for example on proportion-error detection.
- I found no public accuracy data for any commercial app's AI drawing feedback (Simply Draw, Coartist, Vangu).
- Sketch similarity metrics (for example Chamfer distance, SSIM, or CLIP/DINO embedding similarity) were not researched with sources in this session.

---

## 3. AR tracing apps: how they project onto paper, what tech they use, limitations

### Takeaway
AR "tracing" apps do not project light. They overlay a semi-transparent image on the live camera feed, and the user looks at the phone screen while drawing on the paper underneath, usually with the phone on a stand. They anchor the image with ARKit/ARCore world tracking (plane or LiDAR) or with image-target markers. The main limits are drift or wobble, lighting and glare, needing a tripod, and awkward hand-eye coordination. Android stability is reported to be worse.

### Cited Findings
- How it works: the user sees the blank paper through the camera with the reference image overlaid, and pencil lines appear in real time. "ARKit and LiDAR (when available) lock images in 3-D space." The user drags, pinches and rotates to position the image, lowers opacity, then locks it — [Astro Photons AR Drawing](https://astrophotonsapps.com/ar-drawing); [Da Vinci Eye blog](https://davincieyeapp.com/ar-drawing-app/).
- Limitations: one developer says AR drawing is "optimized exclusively for iOS devices due to deeper ARKit integration, with stability and latency remaining hurdles for real-time paper anchoring on Android." Another says projection shifting mid-trace "could ruin the entire drawing." Detection "may wobble" without even lighting and matte paper — [Next Reality](https://mobile-ar.reality.news/news/new-app-lets-your-trace-drawings-from-your-phone-onto-paper-0177174/); [ar-drawings.com](https://www.ar-drawings.com/blog/how-to-trace-drawing-on-paper-with-phone); [ARTrace blog](https://www.artrace.app/blog/how-to-trace-a-photo-onto-paper). These are search-snippet summaries, and it is not always clear which claim comes from which page.
- **Da Vinci Eye** (Mural Maker) uses image-target tracking. Anchors must be high-contrast, detailed, flat and matte, "at least 1/8 the size of the camera's view," and cropped with "no background." Problems include drift from poor anchors, failed detection in bad lighting, and inverted tracking when the anchor is upside down. It also offers value-layer separation, projecting darks, mid-tones and highlights separately — [Da Vinci Eye image tracking help](https://davincieyeapp.com/mural-maker-ar-image-tracking-help/); [Da Vinci Eye](https://davincieyeapp.com/da-vinci-eye/). There is also a Vision Pro version, "Da Vinci Eye: Art Projector" — [App Store](https://apps.apple.com/us/app/da-vinci-eye-art-projector/id6467633766?see-all=reviews&platform=vision).
- **Sketchar** (now listed under MWM) combines AR tracing on paper, walls and murals with an AI-built personalized roadmap, "550+ lessons," 1,000+ templates, a digital canvas with layers, stroke smoothing and time-lapse, and real-time multiplayer on iOS and Android — [sketchar.io](https://sketchar.io/); [MWM Sketchar](https://mwm.ai/apps/sketchar-ar-drawing-app/1221482822); [ARCritic review 2025](https://arcritic.com/2025/sketchar-app-review/).
- MWM, a French app studio, now appears as the publisher of ArtWorkout, Sketchar and Da Vinci Eye, so it runs a portfolio of drawing-learning apps — [MWM ArtWorkout](https://mwm.ai/apps/artworkout-learn-how-to-draw/1564657118); [MWM Sketchar](https://mwm.ai/apps/sketchar-ar-drawing-app/1221482822); [MWM Da Vinci Eye](https://mwm.ai/apps/da-vinci-eye-ar-trace-draw/1120304868).
- The app stores have many low-cost "AR Draw / Trace & Sketch" clones — [AR Drawing: Trace on Paper](https://play.google.com/store/apps/details?id=com.thinklifes.ardraw.sketch.draw.picture.paper); [Draw Easy AI: AR Trace Sketch](https://play.google.com/store/apps/details?id=com.kraph.draweasy&hl=en_US); [ArtEasy top AR apps 2026](https://arteasy.app/blog/top-ar-drawing-apps).

### Inferences
- **[INFERENCE]** AR tracing is now a commodity. Including it is expected, but it does not set an app apart. The camera setup it needs (phone on a stand above the paper) can also feed **live process capture**, meaning periodic frames of the paper as the user draws. That enables step-by-step checking, "you've finished step 3, here's step 4," which Simply Draw appears to lack.
- **[INFERENCE]** Pedagogy risk: tracing produces an attractive result without building observational skill. A stronger app would use tracing as scaffolding that fades out: full overlay, then only key points, then a grid, then no overlay.

### Gaps
- I did not verify accuracy or drift figures for ARKit or ARCore on paper, or whether any tracing app uses ARKit image anchors rather than plane anchors.
- I did not verify whether any app does true camera-based live progress detection during tracing.

---

## 4. On-device vs cloud ML, stylus input, canvas engines

### Takeaway
On-device vision (Core ML; LiteRT, formerly TensorFlow Lite; MediaPipe) is mature enough for page detection, line extraction and small classifiers. Rich critique still needs cloud VLMs. A digital-canvas mode with stylus input gives much richer data than paper: pressure, tilt, timing and stroke order. Only one item in this section, the LiteRT rename, was checked against a source in this session. The rest is background knowledge that needs checking.

### Cited Findings
- Google renamed TensorFlow Lite to **LiteRT** on 2024-09-04. The runtime supports models written in TensorFlow, Keras, JAX and PyTorch. The `.tflite` format and FlatBuffers schema are unchanged, and tensorflow.org/lite now redirects to ai.google.dev/edge/litert — [Google Developers Blog](https://developers.googleblog.com/tensorflow-lite-is-now-litert/); [9to5Google](https://9to5google.com/2024/09/04/tensorflow-lite-litert/).
- In AR tracing, ARKit plus LiDAR is used to lock images in 3D space. Developers say Android (ARCore) anchoring on paper is less stable — see section 3 sources ([Astro Photons](https://astrophotonsapps.com/ar-drawing); [ar-drawings.com](https://www.ar-drawings.com/blog/how-to-trace-drawing-on-paper-with-phone)).

### Inferences
- **[UNVERIFIED BACKGROUND]** Apple **PencilKit** (PKCanvasView, PKDrawing/PKStroke with points carrying force, azimuth, altitude and timeOffset) gives stroke data with pressure and tilt. Apple **Vision** framework has `VNDetectRectanglesRequest` for page detection and `VNDetectContoursRequest` for contours, and **VisionKit** has a document camera. **Core ML** runs models on the Apple Neural Engine.
- **[UNVERIFIED BACKGROUND]** On Android, `MotionEvent` gives pressure, tilt and orientation for S Pen and other styluses. Jetpack **Ink** API (androidx.ink) is Google's newer low-latency inking library. ML Kit has a Document Scanner API. **MediaPipe** Tasks cover hand landmarks, which could tell whether the hand is drawing, and image segmentation.
- **[UNVERIFIED BACKGROUND]** Canvas engine options: native Metal (iOS) or Vulkan/OpenGL (Android) for a custom brush engine; **Skia**, which Flutter's older renderer and Android use; Flutter's **Impeller** renderer; React Native with **react-native-skia** (Shopify). A cross-platform app that needs low-latency inking usually pairs a native ink layer (PencilKit or Jetpack Ink) with a shared UI framework.
- **[INFERENCE]** A hybrid architecture looks like the best fit:
  - On-device: page detection and rectification, line extraction, a basic "did they draw the right thing" classifier (a Quick Draw-style CNN), and reference alignment. These are fast, work offline and keep children's photos private.
  - Cloud VLM: optional natural-language critique on a cropped, face-free image, gated by consent.
- **[INFERENCE]** Stylus or digital mode allows ArtWorkout-style real-time stroke scoring and precise replay. Paper mode matches Simply's positioning ("drawing on paper"). Supporting both is a differentiator.

### Gaps
- None of the Apple or Google developer doc claims above (PencilKit, Vision, Jetpack Ink, ML Kit, MediaPipe, Skia, Impeller, react-native-skia) were fetched in this session. The report writer should cite them as general knowledge or verify them.
- I found no benchmarks for on-device VLMs (for example small Gemma or Qwen-VL models on phones) doing drawing critique.

---

## 5. Generative AI opportunities and existing apps

### Takeaway
By 2026, apps already generate personalized step-by-step tutorials from a user's own photo (Vangu), use AI mentors that adapt practice plans (Coartist), and build AI roadmaps (Sketchar). Simply's stated GenAI use (2024) was only "inspiration." The open ground is combining tutorial generation, geometric plus VLM feedback on the user's actual drawing, and voice tutoring into one loop.

### Cited Findings
- **Vangu: Learn to Draw**: "You upload any photo, pick your favorite art style, and get a personalized step-by-step drawing tutorial built just for that image." AI breaks the drawing into stages, "from blocking in shapes, to refining lines, to final shading," and the user can "snap a photo of your sketch and let AI tell you exactly what to work on next" — [Vangu Google Play (search snippet)](https://play.google.com/store/apps/details?id=com.jaixy.learn_to_draw).
- **Coartist**: AI feedback becomes goals, personalized plans and daily drills. A "new AI Mentor rebuilds or fine-tunes your plan with you, and you approve every change" — [Coartist Google Play (search snippet)](https://play.google.com/store/apps/details?id=com.artistscompany.coartist&hl=en_US).
- **Sketchar**: "AI builds a custom roadmap based on your goals" — [Sketchar](https://sketchar.io/); [MWM Spark](https://spark.mwm.ai/en/apps/sketchar-ar-drawing-app/1221482822).
- Simply (2024): "For Gen AI we mainly thinking how to help users get inspired" — [Product Hunt](https://www.producthunt.com/posts/simply-draw).
- Research direction: VLMs that annotate images, drawing on them to guide users — [SketchVLM, arXiv 2604.22875](https://arxiv.org/pdf/2604.22875).

### Inferences
- **[INFERENCE]** Feasible GenAI features for 2026:
  1. Photo to tutorial. Pipeline: edge or line-art extraction, then a simplification cascade (construction shapes, then contours, then details, then value map), using image models plus deterministic vectorization.
  2. Reference image generation in a controlled style, such as "a cat sitting, simple, 3-value shading," with safety filters for kids.
  3. Adaptive exercise generation, where the next drill targets the error the system detected (proportion, line confidence, values).
  4. A voice tutor: text-to-speech of VLM critique, and possibly a real-time voice agent during a session. This would be the drawing counterpart of Simply's "listening" model.
  5. Overlay feedback, such as red-pen corrections drawn on the user's photo.
- **[INFERENCE]** Tutorials generated from arbitrary photos can be low quality compared with artist-made lessons. A curated core curriculum plus generated extras is the safer approach.
- **[INFERENCE]** Watch for IP and content-safety risk from user-uploaded photos (copyrighted characters, faces of other people).

### Gaps
- I found no reviews or quality data for Vangu's or Coartist's generated tutorials or feedback. Their full store pages could not be fetched because the content was truncated.
- I did not verify the download or revenue figures of these competitors.

---

## 6. Privacy and child safety (COPPA, GDPR, KVKK)

### Takeaway
The amended FTC COPPA Rule took effect around June 2025 and became mandatory on **22 April 2026**. It adds biometric identifiers to personal information and requires written security programs and retention and deletion policies. Photos of drawings taken by children can capture faces, hands, voices and home backgrounds, so they count as sensitive personal data. Simply Draw's App Store label shows Photos/Videos linked to the user and Identifiers used for tracking, on an app rated 4+.

### Cited Findings
- The FTC published the final COPPA amendments on 2025-04-22 in the Federal Register. They took effect about 2025-06-21, with compliance required by **2026-04-22** — [Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule); [BBB National Programs](https://bbbprograms.org/media/insights/blog/coppa-amended); [Finnegan](https://www.finnegan.com/en/insights/articles/coppas-amended-rule-is-now-in-full-effect-what-operators-need-to-know.html).
- The amended rule adds **biometric identifiers**, such as face templates, fingerprints and voiceprints, to "personal information." It requires written information-security programs with annual risk assessments and formal data retention and deletion policies, and it expands the approved parental-consent methods — [Hunton](https://www.hunton.com/privacy-and-information-security-law/ftc-publishes-final-coppa-rule-amendments); [PrivacyLawMap](https://privacylawmap.com/blog/coppa-rule-amendments-april-2026-compliance-checklist); [Promise Legal (EdTech focus)](https://blog.promise.legal/coppa-april-2026-amendments-edtech/).
- Simply Draw privacy label: User Content (Photos/Videos) linked to identity, Identifiers used for tracking, age rating 4+ — [App Store](https://apps.apple.com/us/app/simply-draw-learn-to-draw/id1639875485).

### Inferences
- **[INFERENCE]** Design implications:
  - Process photos on-device by default. Before any upload, crop to the paper and blur any faces or hands.
  - Do not use voice or face data for identification.
  - Get verifiable parental consent before cloud VLM analysis in the under-13 path.
  - Set short retention periods and let users delete their data.
  - Turn off cross-app tracking in kids mode.
  - Let users pick from the camera roll instead of forcing the camera (a user asked for this in a review).
- **[UNVERIFIED BACKGROUND]** GDPR Art. 8 sets the age of digital consent at 16 by default, and member states may lower it to 13. **KVKK** (Turkey, Law No. 6698) requires explicit consent for processing, with parental or guardian consent for minors in practice. It classifies biometric data as special-category, and its 2024 amendments changed cross-border transfer rules, which matters when sending photos to foreign cloud VLM providers. Apple's App Store Kids Category rules restrict third-party analytics and ads.
- **[INFERENCE]** Sending children's drawing photos to third-party LLM APIs requires checking each vendor's data-retention and training terms and their policy on children's data, plus DPAs. Data-residency choices may be needed for KVKK and GDPR.

### Gaps
- I did not fetch or verify primary sources for GDPR Art. 8, KVKK Law 6698 and its 2024 amendment, or Apple Kids Category guidelines in this session.
- I did not look at Simply's own privacy policy for how Simply Draw photos are stored, processed or used for model training.
