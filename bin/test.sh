a="hello world"
echo "A is "
echo $a
b=5
if [ "$b" = 2 ]; then
echo "2"
elif ["$b" = 3 ]; then
echo "3"
else
echo "nono"
fi