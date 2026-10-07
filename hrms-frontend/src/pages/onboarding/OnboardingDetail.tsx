import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import {
  getOnboardingDetail,
  toggleChecklistItem,
  setOnboardingStatus,
} from "@/services/onboarding.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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

const getStatusLabel = (status: OnboardingDetailData["status"]) => {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "ON_HOLD":
      return "On Hold";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
};

const getProgress = (data: OnboardingDetailData) => {
  const allItems = stages.flatMap(
    (stage) => data.itemsByStage[stage] ?? []
  );

  const requiredItems = allItems.filter((item) => item.isRequired);
  const completedRequired = requiredItems.filter(
    (item) => item.isCompleted
  );

  if (requiredItems.length === 0) {
    return 100;
  }

  return Math.round(
    (completedRequired.length / requiredItems.length) * 100
  );
};

export default function OnboardingDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<OnboardingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  const loadDetail = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const response = await getOnboardingDetail(userId);

      setData(response.data);
    } catch (error: any) {
      const message =
        error.message || "Failed to load onboarding details";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [userId]);

  const handleToggle = async (itemId: string) => {
    try {
      setTogglingItemId(itemId);

      const response = await toggleChecklistItem(itemId);

      toast.success(response?.message || "Checklist updated");

      await loadDetail();
    } catch (error: any) {
      const message =
        error.message || "Failed to update checklist item";
      toast.error(message);
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleStatusChange = async (
    status: "IN_PROGRESS" | "ON_HOLD"
  ) => {
    if (!userId) return;

    try {
      await setOnboardingStatus(userId, status);

      toast.success(
        status === "ON_HOLD"
          ? "Onboarding put on hold"
          : "Onboarding resumed"
      );

      await loadDetail();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        "Failed to update onboarding status"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          Loading onboarding details...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">
          Onboarding details not found.
        </p>

        <Button
          variant="outline"
          onClick={() => navigate("/onboarding")}
        >
          Back to Onboarding
        </Button>
      </div>
    );
  }

  const progress = getProgress(data);

  return (
    <div className="space-y-6 p-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("/onboarding")}
        className="cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">

          <div>
            <h1 className="text-2xl font-semibold">
              Onboarding Details
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage employee onboarding checklist
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <Badge
            variant={
              data.status === "COMPLETED"
                ? "add"
                : data.status === "ON_HOLD"
                  ? "secondary"
                  : "outline"
            }
          >
            {getStatusLabel(data.status)}
          </Badge> */}
          {data.status === "IN_PROGRESS" && (
            <Button className="cursor-pointer"
              variant="add"
              onClick={() => handleStatusChange("ON_HOLD")}
            >
              Put On Hold
            </Button>
          )}

          {data.status === "ON_HOLD" && (
            <Button className="cursor-pointer"
              variant="add"
              onClick={() => handleStatusChange("IN_PROGRESS")}
            >
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Employee Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>
              Basic details of the employee
            </CardDescription>
          </div>
          <Badge
            variant={
              data.status === "COMPLETED"
                ? "green"
                : data.status === "ON_HOLD"
                  ? "destructive"
                  : "blue"
            }
          >
            {getStatusLabel(data.status)}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Employee Name
              </p>
              <p className="font-medium mt-1">
                {data.user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Employee Code
              </p>
              <p className="font-medium mt-1">
                {data.user.employeeCode || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Designation
              </p>
              <p className="font-medium mt-1">
                {data.user.designation || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Current Stage
              </p>
              <p className="font-medium mt-1">
                {stageLabels[data.currentStage]}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Start Date
              </p>
              <p className="font-medium mt-1">
                {new Date(data.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Target Date
              </p>
              <p className="font-medium mt-1">
                {data.targetDate
                  ? new Date(data.targetDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Notes
              </p>
              <p className="font-medium mt-1">
                {data.notes || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Progress
              </p>

              <div className="flex items-center gap-3 mt-2">
                <Progress value={progress} className="flex-1" />
                <span className="text-sm font-medium">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stages.map((stage) => {
              const currentIndex = stages.indexOf(data.currentStage);
              const stageIndex = stages.indexOf(stage);

              const isCompleted =
                data.status === "COMPLETED" ||
                stageIndex < currentIndex;

              const isCurrent =
                stage === data.currentStage;

              return (
                <div
                  key={stage}
                  className={`rounded-lg border p-4 text-center ${isCurrent
                    ? "border-primary bg-primary/5"
                    : isCompleted
                      ? "border-green-600/50 bg-green-600/10 "
                      : ""
                    }`}
                >
                  <div className="flex justify-center mb-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <p className="text-sm font-medium">
                    {stageLabels[stage]}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      {stages.map((stage) => {
        const items = data.itemsByStage[stage] ?? [];

        return (
          <Card key={stage}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {stageLabels[stage]}
                </CardTitle>

                <Badge variant="outline">
                  {items.filter((item) => item.isCompleted).length}/
                  {items.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No checklist items configured for this stage.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 rounded-lg border p-4 ${item.isCompleted
                        ? "bg-muted/60"
                        : ""
                        }`}
                    >
                      <Checkbox
                        checked={item.isCompleted}
                        disabled={
                          togglingItemId === item.id ||
                          data.status === "COMPLETED"
                        }
                        onCheckedChange={() =>
                          handleToggle(item.id)
                        }
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`font-medium ${item.isCompleted
                              ? "line-through text-muted-foreground"
                              : ""
                              }`}
                          >
                            {item.title}
                          </p>

                          {item.isRequired && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              Required
                            </Badge>
                          )}

                          {item.requiresDocument && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              Document
                            </Badge>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}

                        {item.isCompleted &&
                          item.completedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Completed on{" "}
                              {new Date(
                                item.completedAt
                              ).toLocaleString()}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}