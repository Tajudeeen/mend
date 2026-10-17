-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "document" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fee" INTEGER,
    "availability" BOOLEAN,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "properties" JSONB NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("eventId","id")
);

-- CreateTable
CREATE TABLE "VendorOffering" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,
    "allergens" TEXT[],
    "restrictions" TEXT[],

    CONSTRAINT "VendorOffering_pkey" PRIMARY KEY ("eventId","participantId","id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "properties" JSONB NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("eventId","id")
);

-- CreateTable
CREATE TABLE "LineupSlot" (
    "id" TEXT NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LineupSlot_pkey" PRIMARY KEY ("eventId","id")
);

-- CreateTable
CREATE TABLE "PlanRevision" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" UUID NOT NULL,
    "revisionId" UUID NOT NULL,
    "slotId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceRecord" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "payload" JSONB NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryRun" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "state" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryReport" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "proposalId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "owner" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationKey" (
    "key" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationKey_pkey" PRIMARY KEY ("owner","key")
);

-- CreateIndex
CREATE INDEX "Event_owner_updatedAt_idx" ON "Event"("owner", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlanRevision_eventId_revision_key" ON "PlanRevision"("eventId", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_revisionId_slotId_key" ON "Assignment"("revisionId", "slotId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_revisionId_participantId_key" ON "Assignment"("revisionId", "participantId");

-- CreateIndex
CREATE INDEX "AuditEvent_eventId_revision_idx" ON "AuditEvent"("eventId", "revision");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOffering" ADD CONSTRAINT "VendorOffering_eventId_participantId_fkey" FOREIGN KEY ("eventId", "participantId") REFERENCES "Participant"("eventId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineupSlot" ADD CONSTRAINT "LineupSlot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRevision" ADD CONSTRAINT "PlanRevision_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "PlanRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceRecord" ADD CONSTRAINT "EvidenceRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryRun" ADD CONSTRAINT "RecoveryRun_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryReport" ADD CONSTRAINT "RecoveryReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Event" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Event" FROM anon;
ALTER TABLE public."Participant" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Participant" FROM anon;
ALTER TABLE public."VendorOffering" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."VendorOffering" FROM anon;
ALTER TABLE public."Zone" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Zone" FROM anon;
ALTER TABLE public."LineupSlot" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."LineupSlot" FROM anon;
ALTER TABLE public."PlanRevision" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."PlanRevision" FROM anon;
ALTER TABLE public."Assignment" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Assignment" FROM anon;
ALTER TABLE public."EvidenceRecord" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."EvidenceRecord" FROM anon;
ALTER TABLE public."RecoveryRun" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."RecoveryRun" FROM anon;
ALTER TABLE public."RecoveryReport" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."RecoveryReport" FROM anon;
ALTER TABLE public."AuditEvent" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."AuditEvent" FROM anon;
ALTER TABLE public."OperationKey" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."OperationKey" FROM anon;
