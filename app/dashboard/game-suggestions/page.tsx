"use client"; // Add this directive at the top

import React, { useState } from "react";
import GameForm from "@/components/game-form";
import GameTable from "@/components/game-table";
import GameDialog from "@/components/game-dialog";

export default function GameSuggestions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogCoverImageUrl, setDialogCoverImageUrl] = useState("");

  const handleOpenDialog = (title: string, coverImageUrl: string) => {
    setDialogTitle(title);
    setDialogCoverImageUrl(coverImageUrl);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div>
        <GameForm onOpenDialog={handleOpenDialog} />
      </div>
      <div>
        {isDialogOpen && (
          <GameDialog
            title={dialogTitle}
            coverImageUrl={dialogCoverImageUrl}
            isDialogOpen={isDialogOpen}
            onClose={handleCloseDialog}
          />
        )}
      </div>
      <div>
        <GameTable />
      </div>
    </div>
  );
}
