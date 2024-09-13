import { useState, useEffect } from 'react'
import useAlert from './useAlert'
import { useTranslateBatchUpdateDismissMutation, useTranslateBatchUpdatesQuery } from 'src/services/update'
import { useTranslateBatchUpdateMutation } from 'src/services/translation'

export function useUpdateCollection() {
  const { data: updates, error, refetch} = useTranslateBatchUpdatesQuery({})
  const [dismissUpdates, dismissUpdatesResult] = useTranslateBatchUpdateDismissMutation()
  const [startUpdate, startUpdateResult] = useTranslateBatchUpdateMutation()

  return {
    updates: updates?.data || [],
    dismissUpdates,
    startUpdate,
    refetch,
  }
}

export default useUpdateCollection