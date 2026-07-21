-- Seed initial gallery photos with pre-generated image URLs
-- These images are stored in S3 via manus-storage
INSERT INTO gallery_photos (title, description, imageUrl, storageKey, category, sortOrder) VALUES
('Beginner Lesson', 'First time on the snow - learning the basics', '/manus-storage/gallery-1_2f414a1a.jpg', 'gallery-1_2f414a1a.jpg', 'Beginner', 10),
('Group Class', 'Group lesson on a blue slope with stunning mountain views', '/manus-storage/gallery-2_86a9d759.jpg', 'gallery-2_86a9d759.jpg', 'Group', 9),
('Kids Lesson', 'Teaching the youngest skiers with patience and fun', '/manus-storage/gallery-3_7e551e5c.jpg', 'gallery-3_7e551e5c.jpg', 'Kids', 8),
('Advanced Carving', 'Mastering advanced carving technique on a black slope', '/manus-storage/gallery-4_e91de019.jpg', 'gallery-4_e91de019.jpg', 'Advanced', 7),
('Private Session', 'Exclusive private lesson on fresh powder', '/manus-storage/gallery-5_a4aabfbd.jpg', 'gallery-5_a4aabfbd.jpg', 'Private', 6),
('Technique Demo', 'Demonstrating proper skiing technique', '/manus-storage/gallery-6_5fdc01c7.jpg', 'gallery-6_5fdc01c7.jpg', 'Technique', 5),
('Family Fun', 'Family ski lesson - creating memories together', '/manus-storage/gallery-7_06176259.jpg', 'gallery-7_06176259.jpg', 'Family', 4),
('Mountain Views', 'Riding the lift with breathtaking mountain panorama', '/manus-storage/gallery-8_77dbf439.jpg', 'gallery-8_77dbf439.jpg', 'Scenic', 3);
