-- MySQL dump 10.13  Distrib 8.0.27, for Linux (x86_64)
--
-- Host: localhost    Database: jiphyeonjeon
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donator` varchar(255) DEFAULT NULL,
  `callSign` varchar(255) BINARY NOT NULL UNIQUE,
  `status` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `infoId` int NOT NULL,
  `donatorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_493671e9872dfd0ec4b35c628a2` (`infoId`),
  KEY `FK_donator_id_from_user` (`donatorId`),
  CONSTRAINT `FK_493671e9872dfd0ec4b35c628a2` FOREIGN KEY (`infoId`) REFERENCES `book_info` (`id`),
  CONSTRAINT `FK_donator_id_from_user` FOREIGN KEY (`donatorId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_info`
--

DROP TABLE IF EXISTS `book_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `publisher` varchar(255) NOT NULL,
  `isbn` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `categoryEnum` varchar(255) NOT NULL,
  `publishedAt` date DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `categoryId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `book_info_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lending`
--

DROP TABLE IF EXISTS `lending`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lending` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lendingLibrarianId` int NOT NULL,
  `lendingCondition` varchar(255) NOT NULL DEFAULT '',
  `returningLibrarianId` int DEFAULT NULL,
  `returningCondition` varchar(255) DEFAULT NULL,
  `returnedAt` datetime(6) DEFAULT NULL,
  `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` int NOT NULL,
  `bookId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_a8128ea55eede64ab4cf5a39fd2` (`userId`),
  KEY `FK_f2adde8c7d298210c39c500d966` (`lendingLibrarianId`),
  KEY `FK_8d7c4d268c930cc5375772f5d87` (`bookId`),
  KEY `FK_returningLibrarianId` (`returningLibrarianId`),
  CONSTRAINT `FK_8d7c4d268c930cc5375772f5d87` FOREIGN KEY (`bookId`) REFERENCES `book` (`id`),
  CONSTRAINT `FK_a8128ea55eede64ab4cf5a39fd2` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_f2adde8c7d298210c39c500d966` FOREIGN KEY (`lendingLibrarianId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_returningLibrarianId` FOREIGN KEY (`returningLibrarianId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `endAt` datetime DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `status` int NOT NULL DEFAULT 0,
  `userId` int NOT NULL,
  `bookId` int DEFAULT NULL,
  `bookInfoId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_529dceb01ef681127fef04d755d` (`userId`),
  KEY `FK_c82001439df87b04c529f301f6e` (`bookId`),
  KEY `FK_bookInfo` (`bookInfoId`),
  CONSTRAINT `FK_529dceb01ef681127fef04d755d` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_c82001439df87b04c529f301f6e` FOREIGN KEY (`bookId`) REFERENCES `book` (`id`),
  CONSTRAINT `FK_bookInfo` FOREIGN KEY (`bookInfoId`) REFERENCES `book_info` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) BINARY NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `intraId` int DEFAULT NULL UNIQUE,
  `slack` varchar(255) DEFAULT NULL UNIQUE,
  `penaltyEndDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1392 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT UNIQUE PRIMARY KEY,
  `name` varchar(255) NOT NULL UNIQUE
);

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-03 11:46:54
