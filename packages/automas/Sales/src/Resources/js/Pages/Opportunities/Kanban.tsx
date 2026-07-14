import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'
import { useDeleteHandler } from '@/hooks/useDeleteHandler'
import { useFlashMessages } from '@/hooks/useFlashMessages'
import { formatCurrency } from '@/utils/helpers'
import AuthenticatedLayout from '@/layouts/authenticated-layout'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Plus, Edit, Trash2, MoreVertical, DollarSign, Calendar, User, List, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import KanbanBoard, { KanbanTask, KanbanColumn, KanbanBoardRef } from '@/components/kanban-board'
import Create from './Create'
import EditOpportunity from './Edit'

interface OpportunitiesByStage {
  [key: string]: KanbanTask[]
}

interface OpportunityKanbanProps {
  opportunities: OpportunitiesByStage
  stages: Array<{ id: number; title: string; color: string }>
}

type ModalMode = 'add' | 'edit'

interface ModalState {
  isOpen: boolean
  mode: ModalMode | ''
  data: any | null
}

// Move OpportunityCard outside main component for better performance
const OpportunityCard = ({ task, onEdit, onDelete, currentDate }: { 
  task: KanbanTask
  onEdit: (task: KanbanTask) => void
  onDelete: (id: number) => void
  currentDate: Date
}) => {
  const { t } = useTranslation()
  
  const isOverdue = task.close_date && !isNaN(Date.parse(task.close_date)) && new Date(task.close_date) < currentDate
  
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      taskId: task.id
    }))
    e.dataTransfer.effectAllowed = 'move'
  }, [task.id])
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 hover:shadow-md transition-all cursor-move select-none group" 
      draggable={true}
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <h4 className="font-medium text-sm text-gray-900 leading-tight flex-1 min-w-0 truncate">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.get(route('sales.opportunities.show', task.id))}>
              <Eye className="h-3 w-3 mr-2" />
              {t('View')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="h-3 w-3 mr-2" />
              {t('Edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600 hover:!text-red-600 focus:text-red-600">
              <Trash2 className="h-3 w-3 mr-2" />
              {t('Delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="space-y-2 mb-3">
        {task.amount && (
          <div className="flex items-center text-xs text-gray-600">
            <DollarSign className="h-3 w-3 mr-1 text-green-600" />
            <span className="font-medium">{formatCurrency(task.amount)}</span>
          </div>
        )}
        {task.account && (
          <div className="flex items-center text-xs text-gray-600">
            <span className="truncate">{task.account}</span>
          </div>
        )}
        {task.probability && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${task.probability}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 min-w-8">{task.probability}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-3">
        {task.assignUser ? (
          <div className="flex items-center text-xs text-gray-600">
            <User className="h-3 w-3 mr-1" />
            <span className="truncate">{task.assignUser}</span>
          </div>
        ) : (
          <div className="h-4 w-4" />
        )}
        
        {task.close_date && !isNaN(Date.parse(task.close_date)) && (
          <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.close_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OpportunityKanban({ opportunities, stages }: OpportunityKanbanProps) {
  const { accounts, contacts, users, stagesData } = usePage().props as any
  const { t } = useTranslation()
  const kanbanRef = useRef<KanbanBoardRef>(null)
  
  useFlashMessages()
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: '',
    data: null
  })
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set())
  const [localOpportunities, setLocalOpportunities] = useState(opportunities)

  useEffect(() => {
    setLocalOpportunities(opportunities)
  }, [opportunities])

  // Cache current date to avoid repeated calculations
  const currentDate = useMemo(() => new Date(), [])

  const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
    routeName: 'sales.opportunities.destroy',
    defaultMessage: t('Are you sure you want to delete this opportunity?')
  })

  const columns: KanbanColumn[] = useMemo(() => 
    stages.map(stage => ({
      id: stage.id.toString(),
      title: stage.title,
      color: stage.color || '#3B82F6'
    })), [stages]
  )

  const handleMove = useCallback((opportunityId: number, fromStage: string, toStage: string) => {
    const stageId = parseInt(toStage)
    
    // Validate parsed stage ID
    if (isNaN(stageId)) {
      console.error(t('Invalid stage ID'))
      return
    }

    router.patch(route('sales.opportunities.update-stage', opportunityId), {
      stage_id: stageId
    }, {
      preserveState: true,
      onSuccess: () => {
        // Success message will be handled by the backend
      },
      onError: (errors) => {
        
        console.error(t('Failed to move opportunity'), errors)
        // Handle error - could revert UI state here
      }
    })
  }, [])

  const openModal = useCallback((mode: ModalMode, data: any = null) => {
    if (mode === 'edit' && data) {
      // Convert kanban task data to opportunity format
      const opportunityData = {
        id: data.id,
        name: data.title,
        description: data.description,
        amount: data.amount,
        probability: data.probability,
        close_date: data.close_date,
        account_id: data.account_id,
        contact_id: data.contact_id || null,
        stage_id: data.stage_id,
        assign_user_id: data.assign_user_id,
        lead_source: data.lead_source || '',
        is_active: data.is_active ?? true
      }

      setModalState({
        isOpen: true,
        mode,
        data: opportunityData
      })
    } else {
      setModalState({
        isOpen: true,
        mode,
        data
      })
    }
  }, [])

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      mode: '',
      data: null
    })
  }, [])

  const handleCreateSuccess = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleUpdateSuccess = useCallback(() => {
    closeModal()
  }, [closeModal])

  // Memoized card component to prevent unnecessary re-renders
  const MemoizedOpportunityCard = useCallback((props: { task: KanbanTask }) => (
    <OpportunityCard 
      {...props} 
      onEdit={openModal.bind(null, 'edit')}
      onDelete={openDeleteDialog}
      currentDate={currentDate}
    />
  ), [openModal, openDeleteDialog, currentDate])

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t('Sales') },
        { label: t('Opportunities'), url: route('sales.opportunities.index') },
        { label: t('Kanban Board') }
      ]}
      pageTitle={t('Opportunity Kanban Board')}
      pageActions={
        <div className="flex gap-2">
          <TooltipProvider>
            <Button variant="outline" size="sm" onClick={() => router.get(route('sales.opportunities.index'))}>
              <List className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => openModal('add')}>
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipProvider>
        </div>
      }
    >
      <Head title={t('Opportunity Kanban Board')} />

      <KanbanBoard
        ref={kanbanRef}
        tasks={localOpportunities}
        columns={columns}
        onMove={handleMove}
        taskCard={MemoizedOpportunityCard}
        kanbanActions={(columnId: string) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/50"
            onClick={() => openModal('add', { stage_id: parseInt(columnId) })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        collapsedColumns={collapsedColumns}
      />

      <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
        {modalState.mode === 'add' && (
          <Create
            onSuccess={handleCreateSuccess}
            accounts={accounts || []}
            contacts={contacts || []}
            stages={stagesData || []}
            users={users || []}
            selectedStageId={modalState.data?.stage_id}
          />
        )}
        {modalState.mode === 'edit' && modalState.data && (
          <EditOpportunity
            key={modalState.data.id}
            opportunity={modalState.data}
            onSuccess={handleUpdateSuccess}
            accounts={accounts || []}
            contacts={contacts || []}
            stages={stagesData || []}
            users={users || []}
          />
        )}
      </Dialog>
      
      <ConfirmationDialog
        open={deleteState.isOpen}
        onOpenChange={closeDeleteDialog}
        title={t('Delete Opportunity')}
        message={deleteState.message}
        confirmText={t('Delete')}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </AuthenticatedLayout>
  )
}