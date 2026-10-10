import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  getOnboardingDetail,
  toggleChecklistItem,
  setOnboardingStatus,
} from "@/services/onboarding.service";

import { Button } from "@/components/ui/button";
import {
 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

type Stage =
  | "OFFER"
  | "JOINING"
  | "DOCUMENTS"
  | "TRAINING"
  | "ACTIVE";

interface ChecklistItem {
  id: string;
  stage: Stage;
  title: string;
  description: string | null;
  isRequired: boolean;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null;
  requiresDocument: boolean;
  documentUrl: string | null;
}

interface OnboardingDetailData {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    employeeCode: string | null;
    designation: string | null;
  };
  currentStage: Stage;
  status: "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  startDate: string;
  targetDate: string | null;
  notes: string | null;
  completedAt: string | null;
  itemsByStage: Record<Stage, ChecklistItem[]>;
}

const stages: Stage[] = [
  "OFFER",
  "JOINING",
  "DOCUMENTS",
  "TRAINING",
  "ACTIVE",
];

const stageLabels: Record<Stage, string> = {
  OFFER: "Offer",
  JOINING: "Joining",
  DOCUMENTS: "Documents",
  TRAINING: "Training",
  ACTIVE: "Active",
};

const getStatusBadge = (
  status: OnboardingDetailData["status"]
) => {
  switch (status) {
    case "IN_PROGRESS":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
          In Progress
        </Badge>
      );

    case "ON_HOLD":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
          On Hold
        </Badge>
      );

    case "COMPLETED":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
          Completed
        </Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

/* --------------------------------------------------
   Overall Progress
-------------------------------------------------- */

const getProgress = (data: OnboardingDetailData) => {
  const allItems = stages.flatMap(
    (stage) => data.itemsByStage[stage] ?? []
  );

  const requiredItems = allItems.filter(
    (item) => item.isRequired
  );

  if (requiredItems.length === 0) return 100;

  const completedRequired = requiredItems.filter(
    (item) => item.isCompleted
  );

  return Math.round(
    (completedRequired.length / requiredItems.length) * 100
  );
};

/* --------------------------------------------------
   Stage Completion
-------------------------------------------------- */

const isStageCompleted = (
  data: OnboardingDetailData,
  stage: Stage
) => {
  const items = data.itemsByStage[stage] ?? [];

  if (items.length === 0) {
    return false;
  }

  const requiredItems = items.filter(
    (item) => item.isRequired
  );

  /*
    If stage has required items:
    all required items must be completed.
  */
  if (requiredItems.length > 0) {
    return requiredItems.every(
      (item) => item.isCompleted
    );
  }

  /*
    If stage has no required items:
    consider stage complete when all items are completed.
  */
  return items.every(
    (item) => item.isCompleted
  );
};

/* --------------------------------------------------
   Current Stage
-------------------------------------------------- */

const getCalculatedCurrentStage = (
  data: OnboardingDetailData
): Stage => {
  const firstIncompleteStage = stages.find(
    (stage) => !isStageCompleted(data, stage)
  );

  return firstIncompleteStage ?? "ACTIVE";
};

export default function OnboardingDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [data, setData] =
    useState<OnboardingDetailData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [togglingItemId, setTogglingItemId] =
    useState<string | null>(null);

  /* --------------------------------------------------
     Load Detail
  -------------------------------------------------- */

  const loadDetail = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const response =
        await getOnboardingDetail(userId);

      setData(response.data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load onboarding details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [userId]);

  /* --------------------------------------------------
     Toggle Checklist Item
  -------------------------------------------------- */

  const handleToggle = async (
    stage: Stage,
    itemId: string
  ) => {
    if (!data) return;

    setTogglingItemId(itemId);

    /*
      Save complete previous state.

      If API fails, we restore this state.
    */
    const previousData = structuredClone(data);

    /*
      Optimistic update.

      Tick  -> Untick
      Untick -> Tick
    */
    const updatedStageItems =
      data.itemsByStage[stage].map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const newCompletedState =
          !item.isCompleted;

        return {
          ...item,
          isCompleted: newCompletedState,
          completedAt: newCompletedState
            ? new Date().toISOString()
            : null,
        };
      });

    const updatedData: OnboardingDetailData = {
      ...data,
      itemsByStage: {
        ...data.itemsByStage,
        [stage]: updatedStageItems,
      },
    };

    /*
      Immediately update UI.

      This makes:
      - checklist count update
      - progress update
      - stage progression update
      - current stage update
    */
    setData(updatedData);

    try {
      const response =
        await toggleChecklistItem(itemId);

      toast.success(
        response?.message ||
        "Checklist updated successfully"
      );
    } catch (error: any) {
      setData(previousData);

      toast.error(error?.message || "Failed to update checklist item");
    } finally {
      setTogglingItemId(null);
    }
  };

  /* --------------------------------------------------
     Status Change
  -------------------------------------------------- */

  const handleStatusChange = async (
    status: "IN_PROGRESS" | "ON_HOLD"
  ) => {
    if (!userId) return;

    try {
      await setOnboardingStatus(
        userId,
        status
      );

      toast.success(
        status === "ON_HOLD"
          ? "Onboarding put on hold"
          : "Onboarding resumed"
      );

      await loadDetail();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  /* --------------------------------------------------
     Loading
  -------------------------------------------------- */

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  /* --------------------------------------------------
     No Data
  -------------------------------------------------- */

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">
          Onboarding details not found.
        </p>

        <Button
          variant="outline"
          onClick={() =>
            navigate("/onboarding")
          }
        >
          Back to Onboarding
        </Button>
      </div>
    );
  }

  /* --------------------------------------------------
     Calculated Values
  -------------------------------------------------- */

  const progress = getProgress(data);

  const calculatedCurrentStage =
    getCalculatedCurrentStage(data);

  const currentStageIndex =
    stages.indexOf(calculatedCurrentStage);

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">

      {/* --------------------------------------------------
          Top Bar
      -------------------------------------------------- */}

      <div className="flex items-center justify-between">
        <Button
          variant="add"
          size="sm"
          onClick={() =>
            navigate("/onboarding")
          }
          className="gap-2 cursor-pointer "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>

        <div>
          {data.status === "IN_PROGRESS" && (
            <Button className="cursor-pointer"
              variant="add"
              size="sm"
              onClick={() =>
                handleStatusChange("ON_HOLD")
              }
            >
              Put On Hold
            </Button>
          )}

          {data.status === "ON_HOLD" && (
            <Button className="cursor-pointer"
              variant="add"
              size="sm"
              onClick={() =>
                handleStatusChange("IN_PROGRESS")
              }
            >
              Resume Onboarding
            </Button>
          )}
        </div>
      </div>

      {/* --------------------------------------------------
          Header Info
      -------------------------------------------------- */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.user.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            {data.user.designation ||
              "Employee"}{" "}
            •{" "}
            {data.user.employeeCode ||
              "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(data.status)}
        </div>
      </div>

      {/* --------------------------------------------------
          Summary
      -------------------------------------------------- */}

      {/* Summary */}
      <div className="overflow-hidden  rounded-lg border border-1">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4">

            {/* Current Stage */}
            <div className="p-4 sm:p-5 border-b md:border-b-0 md:border-r">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Current Stage
              </p>

              <p className="text-base sm:text-lg font-semibold mt-1">
                {stageLabels[calculatedCurrentStage]}
              </p>
            </div>

            {/* Start Date */}
            <div className="p-4 sm:p-5 border-b md:border-b-0 md:border-r">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Start Date
              </p>

              <p className="text-base sm:text-lg font-semibold mt-1">
                {new Date(data.startDate).toLocaleDateString()}
              </p>
            </div>

            {/* Target Date */}
            <div className="p-4 sm:p-5 border-b md:border-b-0 md:border-r">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Target Date
              </p>

              <p className="text-base sm:text-lg font-semibold mt-1">
                {data.targetDate
                  ? new Date(data.targetDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            {/* Overall Progress */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Overall Progress
                </p>

                <span className="text-xs font-semibold">
                  {progress}%
                </span>
              </div>

              <Progress
                value={progress}
                className="h-2 mt-3"
              />
            </div>

          </div>
        </CardContent>
      </div>

      {/* --------------------------------------------------
          Stage Progression
      -------------------------------------------------- */}

      <div className="border border-1 rounded-lg p-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Stage Progression
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

            {stages.map((stage, idx) => {
              const stageCompleted =
                isStageCompleted(
                  data,
                  stage
                );

              const isCurrent =
                !stageCompleted &&
                idx === currentStageIndex;

              /*
                IMPORTANT:
                Stage completion is now calculated
                from checklist items.

                So when checkbox changes,
                this card changes immediately.
              */

              return (
                <div
                  key={stage}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors ${isCurrent
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : stageCompleted
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                      : "border-slate-100 text-muted-foreground"
                    }`}
                >
                  {stageCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-1" />
                  ) : (
                    <Circle
                      className={`h-5 w-5 mb-1 ${isCurrent
                        ? "text-primary"
                        : "text-slate-300"
                        }`}
                    />
                  )}

                  <span className="text-xs">
                    {stageLabels[stage]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* --------------------------------------------------
          Stages Checklist
      -------------------------------------------------- */}

      <div className="space-y-4">

        {stages.map((stage) => {
          const items =
            data.itemsByStage[stage] ?? [];

          const completedCount =
            items.filter(
              (item) =>
                item.isCompleted
            ).length;

          return (
            <div
              className="border rounded-lg overflow-hidden"
              key={stage}
            >
              <CardHeader className="pb-2 px-3 sm:px-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm sm:text-md font-semibold">
                    {stageLabels[stage]}
                  </CardTitle>

                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs font-normal shrink-0"
                  >
                    {completedCount} / {items.length} Done
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 px-3 sm:px-6">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No items configured for this stage.
                  </p>
                ) : (
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 sm:p-3.5 transition-colors ${item.isCompleted
                          ? "bg-muted/30"
                          : "hover:bg-muted/10"
                          }`}
                      >
                        {/* Main Row */}
                        <div className="flex items-start gap-2 sm:gap-3">

                          {/* Checkbox */}
                          <Checkbox
                            id={item.id}
                            checked={item.isCompleted}
                            disabled={
                              togglingItemId === item.id ||
                              data.status === "COMPLETED"
                            }
                            onCheckedChange={() =>
                              handleToggle(stage, item.id)
                            }
                            className="mt-0.5 shrink-0"
                          />

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={item.id}
                              className={`text-sm font-medium leading-5 cursor-pointer break-words ${item.isCompleted
                                ? "line-through text-muted-foreground"
                                : ""
                                }`}
                            >
                              {item.title}
                            </label>

                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-4 break-words">
                                {item.description}
                              </p>
                            )}

                            {item.isCompleted &&
                              item.completedAt && (
                                <p className="text-[11px] text-muted-foreground/80 mt-1">
                                  Completed on{" "}
                                  {new Date(
                                    item.completedAt
                                  ).toLocaleDateString()}
                                </p>
                              )}

                            {/* Mobile / Responsive Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {item.isRequired && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0.5 text-amber-600 border-amber-200"
                                >
                                  Required
                                </Badge>
                              )}

                              {item.requiresDocument && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0.5 gap-1"
                                >
                                  <FileText className="h-3 w-3 shrink-0" />
                                  <span>Doc Required</span>
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Document / Loader */}
                          <div className="flex items-center shrink-0">
                            {item.documentUrl && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                asChild
                              >
                                <a
                                  href={item.documentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}

                            {togglingItemId === item.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          );
        })}
      </div>
    </div>
  );
}