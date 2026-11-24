-- Bikes registered as free text move to the listed model they name without ambiguity; the
-- rest keep what was typed. Mirrors matchBikeModel in src/server/bike-models.ts. The join
-- request is left as the person wrote it.

UPDATE "Bike" SET "model" = 'Scrambler 400 X', "engineSize" = 400
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler400x', 'scrambler400x400');

UPDATE "Bike" SET "model" = 'Scrambler 400 XC', "engineSize" = 400
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler400xc', 'scrambler400xc400');

UPDATE "Bike" SET "model" = 'Scrambler 900', "engineSize" = 900
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler900', 'scrambler900900');

UPDATE "Bike" SET "model" = 'Street Scrambler', "engineSize" = 900
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('streetscrambler', 'streetscrambler900');

UPDATE "Bike" SET "model" = 'Scrambler 1200 X', "engineSize" = 1200
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler1200x', 'scrambler1200x1200');

UPDATE "Bike" SET "model" = 'Scrambler 1200 XC', "engineSize" = 1200
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler1200xc', 'scrambler1200xc1200');

UPDATE "Bike" SET "model" = 'Scrambler 1200 XE', "engineSize" = 1200
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler1200xe', 'scrambler1200xe1200');

UPDATE "Bike" SET "model" = 'Scrambler 865', "engineSize" = 865
WHERE regexp_replace(lower("model"), 'triumph|cc|[^a-z0-9]', '', 'g') IN ('scrambler865', 'scrambler865865');
