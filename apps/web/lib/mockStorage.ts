// Shared in-memory storage for development mode (when Supabase is not configured)
// This provides persistence between API calls during development

export interface MockFolder {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  goal_count: number
  created_at: string
  updated_at: string
}

export interface MockGoal {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  description: string | null
  color: string
  deadline_date: string | null
  goal_type: string
  goal_description: string | null
  goal_status: string
  goal_priority: string
  goal_progress: number
  connected_bookmarks: any[]
  tags: any[]
  notes: string | null
  created_at: string
  updated_at: string
}

class MockStorage {
  private folders: MockFolder[] = []
  private goals: MockGoal[] = []

  // Folder operations
  getFolders(userId: string): MockFolder[] {
    const userFolders = this.folders.filter(folder => folder.user_id === userId)
    console.log(`📁 MockStorage: getFolders for user ${userId} - found ${userFolders.length} folders`)
    console.log(`📁 MockStorage: User folders:`, userFolders.map(f => ({ id: f.id, name: f.name })))
    console.log(`📁 MockStorage: Total folders in storage: ${this.folders.length}`)
    return userFolders
  }

  addFolder(folder: MockFolder): void {
    this.folders.push(folder)
    console.log(`📁 MockStorage: Added folder "${folder.name}" (ID: ${folder.id}) for user ${folder.user_id}, total folders: ${this.folders.length}`)
    console.log(`📁 MockStorage: All folders:`, this.folders.map(f => ({ id: f.id, name: f.name, user_id: f.user_id })))
  }

  updateFolder(folderId: string, updates: Partial<MockFolder>): MockFolder | null {
    const folderIndex = this.folders.findIndex(folder => folder.id === folderId)

    if (folderIndex === -1) {
      console.log(`📁 MockStorage: Folder ${folderId} not found for update`)
      return null
    }

    this.folders[folderIndex] = {
      ...this.folders[folderIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log(`📁 MockStorage: Updated folder "${this.folders[folderIndex].name}"`)
    return this.folders[folderIndex]
  }

  deleteFolder(folderId: string, userId: string, handleGoals: string = 'unassign'): boolean {
    const folderIndex = this.folders.findIndex(folder => folder.id === folderId && folder.user_id === userId)

    if (folderIndex === -1) {
      console.log(`📁 MockStorage: Folder ${folderId} not found for deletion`)
      return false
    }

    // Handle goals in the folder
    if (handleGoals === 'delete') {
      // Delete all goals in the folder
      this.goals = this.goals.filter(goal => !(goal.folder_id === folderId && goal.user_id === userId))
      console.log(`🎯 MockStorage: Deleted all goals in folder ${folderId}`)
    } else {
      // Unassign goals from folder (set folder_id to null)
      this.goals.forEach(goal => {
        if (goal.folder_id === folderId && goal.user_id === userId) {
          goal.folder_id = null
          goal.updated_at = new Date().toISOString()
        }
      })
      console.log(`🎯 MockStorage: Unassigned all goals from folder ${folderId}`)
    }

    // Delete the folder
    const deletedFolder = this.folders.splice(folderIndex, 1)[0]
    console.log(`📁 MockStorage: Deleted folder "${deletedFolder.name}", remaining folders: ${this.folders.length}`)
    return true
  }

  // Goal operations
  getGoals(userId: string, folderId?: string): MockGoal[] {
    let userGoals = this.goals.filter(goal => goal.user_id === userId)
    
    if (folderId) {
      if (folderId === 'null' || folderId === 'unassigned') {
        userGoals = userGoals.filter(goal => !goal.folder_id)
      } else {
        userGoals = userGoals.filter(goal => goal.folder_id === folderId)
      }
    }
    
    return userGoals
  }

  addGoal(goal: MockGoal): void {
    this.goals.push(goal)
    console.log(`🎯 MockStorage: Added goal "${goal.name}", total goals: ${this.goals.length}`)
  }

  updateGoal(goalId: string, userId: string, updates: Partial<MockGoal>): MockGoal | null {
    const goalIndex = this.goals.findIndex(goal => goal.id === goalId && goal.user_id === userId)

    if (goalIndex === -1) {
      return null
    }

    this.goals[goalIndex] = {
      ...this.goals[goalIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    console.log(`🎯 MockStorage: Updated goal "${this.goals[goalIndex].name}"`)
    return this.goals[goalIndex]
  }

  deleteGoal(goalId: string, userId: string): boolean {
    const goalIndex = this.goals.findIndex(goal => goal.id === goalId && goal.user_id === userId)

    if (goalIndex === -1) {
      console.log(`🎯 MockStorage: Goal ${goalId} not found for deletion`)
      return false
    }

    const deletedGoal = this.goals.splice(goalIndex, 1)[0]
    console.log(`🎯 MockStorage: Deleted goal "${deletedGoal.name}", remaining goals: ${this.goals.length}`)
    return true
  }

  // Debug methods
  getStats(): { folders: number; goals: number } {
    return {
      folders: this.folders.length,
      goals: this.goals.length
    }
  }

  clear(): void {
    this.folders = []
    this.goals = []
    console.log('🗑️ MockStorage: Cleared all data')
  }
}

// Export singleton instance
export const mockStorage = new MockStorage()
