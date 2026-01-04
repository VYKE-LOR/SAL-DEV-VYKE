local resourceName = 'sal_craftingframework'

package.path = package.path
  .. (';@%s/?.lua'):format(resourceName)
  .. (';@%s/?/init.lua'):format(resourceName)
  .. (';@%s/?/?.lua'):format(resourceName)
