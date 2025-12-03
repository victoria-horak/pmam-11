namespace Jarvice.CommandProcessor.Interfaces;

public interface ICommand
{
	string Name { get; }
	Task ExecuteAsync();
}
