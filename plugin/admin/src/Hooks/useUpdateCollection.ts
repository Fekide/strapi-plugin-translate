import {
  useTranslateBatchUpdateDismissMutation,
  useTranslateBatchUpdatesQuery,
} from '../services/update'
import { useTranslateBatchUpdateMutation } from '../services/translation'

export function useUpdateCollection() {
  const { data: updates, error, refetch } = useTranslateBatchUpdatesQuery({})
  const [dismissUpdates, dismissUpdatesResult] =
    useTranslateBatchUpdateDismissMutation()
  const [startUpdate, startUpdateResult] = useTranslateBatchUpdateMutation()

  return {
    updates: updates?.data || [],
    dismissUpdates,
    startUpdate,
    refetch,
  }
}

export default useUpdateCollection
