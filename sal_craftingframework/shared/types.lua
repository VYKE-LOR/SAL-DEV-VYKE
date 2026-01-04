local Types = {}

Types.Payloads = {
  Open = 'sal_crafting:open',
  UpdateSnapshot = 'sal_crafting:updateSnapshot',
  Toast = 'sal_crafting:toast',
  Close = 'sal_crafting:close',
}

Types.NuiCallbacks = {
  Ready = 'ui_ready',
  RequestSnapshot = 'request_snapshot',
  SelectBench = 'select_bench',
  CraftNow = 'craft_now',
  QueueAdd = 'queue_add',
  QueueClaim = 'queue_claim',
  QueueCancel = 'queue_cancel',
  AdminSaveRecipe = 'admin_save_recipe',
  AdminDeleteRecipe = 'admin_delete_recipe',
  AdminSaveCategory = 'admin_save_category',
  AdminDeleteCategory = 'admin_delete_category',
  AdminSaveBlueprint = 'admin_save_blueprint',
  AdminDeleteBlueprint = 'admin_delete_blueprint',
  AdminSaveBenchType = 'admin_save_benchType',
  AdminDeleteBenchType = 'admin_delete_benchType',
  AdminSaveBenchLocation = 'admin_save_benchLocation',
  AdminDeleteBenchLocation = 'admin_delete_benchLocation',
  AdminTeleportBenchLocation = 'admin_teleport_benchLocation',
}

return Types
