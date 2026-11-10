CREATE TABLE `Session` (
  `digest` CHAR(64) NOT NULL PRIMARY KEY,
  `userId` INTEGER NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  INDEX `Session_userId_idx` (`userId`),
  INDEX `Session_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
